import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  GameAction,
  GameType,
  NetworkMessage,
  Player,
  SessionState,
} from '../types/game';
import {
  applyAction,
  createSession,
  finishGame,
  rejectAction,
  returnToLobby,
  startGame,
} from '../games/ruleEngine';
import { getMultiplayerService } from '../multiplayer';
import { normalizeJoinCode } from '../constants/relay';
import { loadSavedPlayerName, savePlayerName } from '../services/playerNameStorage';
import {
  clearSessionIdentity,
  loadSessionIdentity,
  saveSessionIdentity,
} from '../services/sessionIdentityStorage';
import { usePreferencesStore } from './preferencesStore';
import { usePurchaseStore } from './purchaseStore';
import { useStatsStore } from './statsStore';
import { resolveIncomingJoin } from '../games/hostJoin';
import { collectNewlySpottedPlates } from '../utils/collectSpottedPlates';
import { canStartHostedSession } from '../utils/hostEntitlement';
import { usePlateCollectionStore } from './plateCollectionStore';
import type { GameRules } from '../types/preferences';

type HostGameOptions = {
  solo?: boolean;
};

interface SessionStore {
  localPlayerId: string;
  localPlayerName: string;
  isHost: boolean;
  /** Local offline session — no relay room or waiting room. */
  isSolo: boolean;
  session: SessionState | null;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';
  /** Guests: false when the host phone has left the relay room. Hosts/solo stay true. */
  hostPresent: boolean;
  relayJoinCode: string | null;
  toast: string | null;
  initialized: boolean;

  initialize: () => Promise<void>;
  reset: () => void;
  setLocalName: (name: string) => void;
  hostGame: (gameType: GameType, hostName: string, options?: HostGameOptions) => Promise<string>;
  joinWithCode: (joinCode: string, playerName: string) => Promise<string>;
  startHostedGame: () => void;
  restartSoloGame: () => void;
  updateSessionRules: (partial: Partial<GameRules>) => void;
  finishGameAsHost: () => void;
  returnToLobbyAsHost: () => void;
  leaveActiveGame: () => void;
  dispatchAction: (action: GameAction) => void;
  clearToast: () => void;
}

function playerFromLocal(id: string, name: string, isHost: boolean): Player {
  return { id, name, isHost, connected: true };
}

export const useSessionStore = create<SessionStore>((set, get) => {
  let unsubscribeMessages: (() => void) | null = null;
  let unsubscribeConnection: (() => void) | null = null;
  let unsubscribeHostPresence: (() => void) | null = null;

  const multiplayer = getMultiplayerService();

  const commitSession = (
    nextSession: SessionState,
    extra?: Partial<Pick<SessionStore, 'connectionStatus' | 'localPlayerId' | 'toast' | 'hostPresent'>>,
  ) => {
    const previousSession = get().session;
    const localPlayerId = extra?.localPlayerId ?? get().localPlayerId;
    useStatsStore
      .getState()
      .recordFinishedSession(previousSession, nextSession, localPlayerId);
    const spotted = collectNewlySpottedPlates(previousSession, nextSession, localPlayerId);
    usePlateCollectionStore.getState().recordSpotted(spotted);
    set({ session: nextSession, ...extra });
  };

  const handleNetworkMessage = (message: NetworkMessage, fromPeerId?: string) => {
    const state = get();
    const localId = state.localPlayerId;

    switch (message.type) {
      case 'JOIN': {
        if (!state.isHost || !state.session) {
          return;
        }
        const joinerId = fromPeerId ?? uuidv4();
        const resolution = resolveIncomingJoin(
          state.session,
          message.name,
          joinerId,
          (id, name) => playerFromLocal(id, name, false),
        );
        if (resolution.kind === 'rewelcome') {
          multiplayer.send({
            type: 'WELCOME',
            playerId: resolution.playerId,
            state: state.session,
          });
          break;
        }
        commitSession(resolution.nextSession);
        multiplayer.send({
          type: 'WELCOME',
          playerId: resolution.player.id,
          state: resolution.nextSession,
        });
        multiplayer.send({
          type: 'PLAYER_JOINED',
          player: resolution.player,
          state: resolution.nextSession,
        });
        break;
      }
      case 'WELCOME': {
        if (!state.isHost && message.playerId) {
          commitSession(message.state, {
            localPlayerId: message.playerId,
            connectionStatus: 'connected',
            hostPresent: true,
          });
          const joinCode = multiplayer.getJoinCode();
          if (joinCode) {
            void saveSessionIdentity({
              peerId: message.playerId,
              sessionId: message.state.sessionId,
              joinCode,
              isHost: false,
              displayName: state.localPlayerName,
            });
          }
        }
        break;
      }
      case 'PLAYER_JOINED':
      case 'STATE_UPDATE':
      case 'START_GAME':
        commitSession(message.state, { connectionStatus: 'connected' });
        break;
      case 'ACTION': {
        if (!state.isHost || !state.session) {
          return;
        }
        const result = applyAction(state.session, message.playerId, message.action);
        if (result.ok) {
          commitSession(result.state);
          multiplayer.send({ type: 'STATE_UPDATE', state: result.state });
        } else {
          const rejected = rejectAction(state.session, message.playerId, result.reason);
          commitSession(rejected);
          multiplayer.send({
            type: 'ACTION_REJECTED',
            playerId: message.playerId,
            reason: result.reason,
          });
        }
        break;
      }
      case 'ACTION_REJECTED': {
        if (message.playerId === localId) {
          set({ toast: message.reason });
        }
        break;
      }
      default:
        break;
    }
  };

  return {
    localPlayerId: uuidv4(),
    localPlayerName: '',
    isHost: false,
    isSolo: false,
    session: null,
    connectionStatus: 'idle',
    hostPresent: true,
    relayJoinCode: null,
    toast: null,
    initialized: false,

    initialize: async () => {
      if (get().initialized) {
        return;
      }
      await multiplayer.initialize();
      unsubscribeMessages = multiplayer.onMessage(handleNetworkMessage);
      unsubscribeConnection?.();
      unsubscribeConnection = multiplayer.onConnectionChange?.((status) => {
        const current = get();
        if (!current.session) {
          return;
        }
        if (status === 'connected') {
          set({ connectionStatus: 'connected' });
        } else if (status === 'reconnecting') {
          set({ connectionStatus: 'reconnecting' });
        } else if (status === 'disconnected') {
          set({ connectionStatus: 'disconnected' });
        }
      }) ?? null;
      unsubscribeHostPresence?.();
      unsubscribeHostPresence = multiplayer.onHostPresence?.((present) => {
        const current = get();
        if (!current.session || current.isHost || current.isSolo) {
          return;
        }
        set({ hostPresent: present });
      }) ?? null;
      const savedName = await loadSavedPlayerName();
      if (savedName) {
        set({ localPlayerName: savedName });
      }
      set({ initialized: true });
    },

    reset: () => {
      unsubscribeMessages?.();
      unsubscribeConnection?.();
      unsubscribeHostPresence?.();
      unsubscribeMessages = null;
      unsubscribeConnection = null;
      unsubscribeHostPresence = null;
      void clearSessionIdentity();
      set({
        session: null,
        isHost: false,
        isSolo: false,
        connectionStatus: 'idle',
        hostPresent: true,
        toast: null,
        relayJoinCode: null,
        localPlayerId: uuidv4(),
      });
    },

    setLocalName: (name: string) => {
      set({ localPlayerName: name });
      void savePlayerName(name);
    },

    hostGame: async (gameType, hostName, options) => {
      const solo = options?.solo === true;
      if (
        !canStartHostedSession({
          solo,
          canHost: usePurchaseStore.getState().canHost(),
        })
      ) {
        set({ toast: 'Host unlock required to play online.' });
        throw new Error('Host unlock required');
      }

      const sessionId = uuidv4().slice(0, 8);
      const hostId = get().localPlayerId;
      const host = playerFromLocal(hostId, hostName, true);
      const gameRules = usePreferencesStore.getState().getDefaultGameRules();
      let session = createSession(sessionId, host, gameType, gameRules);
      void savePlayerName(hostName);

      if (solo) {
        session = startGame(session);
        void clearSessionIdentity();
        set({
          isHost: true,
          isSolo: true,
          localPlayerName: hostName,
          session,
          connectionStatus: 'idle',
          hostPresent: true,
          relayJoinCode: null,
        });
        return sessionId;
      }

      await multiplayer.hostSession(sessionId, hostName, gameType);
      const joinCode = multiplayer.getJoinCode();
      if (joinCode) {
        void saveSessionIdentity({
          peerId: hostId,
          sessionId,
          joinCode,
          isHost: true,
          displayName: hostName,
        });
      }
      set({
        isHost: true,
        isSolo: false,
        localPlayerName: hostName,
        session,
        connectionStatus: 'connected',
        hostPresent: true,
        relayJoinCode: multiplayer.getJoinCode(),
      });
      return sessionId;
    },

    joinWithCode: async (joinCode, playerName) => {
      const trimmed = playerName.trim();
      if (!multiplayer.joinByCode) {
        throw new Error('Online join is not available.');
      }

      void savePlayerName(trimmed);
      set({
        connectionStatus: 'connecting',
        localPlayerName: trimmed,
        isHost: false,
        isSolo: false,
      });

      const normalizedCode = normalizeJoinCode(joinCode);
      const savedIdentity = await loadSessionIdentity();
      if (
        savedIdentity &&
        normalizeJoinCode(savedIdentity.joinCode) === normalizedCode &&
        savedIdentity.displayName.trim().toLowerCase() === trimmed.toLowerCase()
      ) {
        multiplayer.setLocalPeerId?.(savedIdentity.peerId);
        set({ localPlayerId: savedIdentity.peerId });
      }

      try {
        const sessionId = await multiplayer.joinByCode(joinCode, trimmed);
        set({ connectionStatus: 'connecting', relayJoinCode: multiplayer.getJoinCode() });
        return sessionId;
      } catch (error) {
        set({
          connectionStatus: 'error',
          toast: error instanceof Error ? error.message : 'Could not join with that code.',
        });
        throw error;
      }
    },

    startHostedGame: () => {
      const { session, isHost, isSolo } = get();
      if (!isHost || !session || isSolo) {
        return;
      }
      const next = startGame(session);
      commitSession(next);
      multiplayer.send({ type: 'START_GAME', gameType: next.gameType!, state: next });
    },

    restartSoloGame: () => {
      const { session, isHost, isSolo } = get();
      if (!isHost || !isSolo || !session) {
        return;
      }
      commitSession(startGame(returnToLobby(session)));
    },

    updateSessionRules: (partial) => {
      const { session, isHost } = get();
      if (!isHost || !session || session.phase !== 'lobby') {
        return;
      }
      const next: SessionState = {
        ...session,
        gameRules: {
          ...session.gameRules,
          ...partial,
          'sign-game': {
            ...session.gameRules['sign-game'],
            ...partial['sign-game'],
          },
          'license-plates': {
            ...session.gameRules['license-plates'],
            ...partial['license-plates'],
          },
          bingo: {
            ...session.gameRules.bingo,
            ...partial.bingo,
          },
        },
      };
      commitSession(next);
      multiplayer.send({ type: 'STATE_UPDATE', state: next });
    },

    finishGameAsHost: () => {
      const { session, isHost } = get();
      if (!isHost || !session || session.phase !== 'playing') {
        return;
      }
      const next = finishGame(session);
      commitSession(next);
      multiplayer.send({ type: 'STATE_UPDATE', state: next });
    },

    returnToLobbyAsHost: () => {
      const { session, isHost } = get();
      if (!isHost || !session) {
        return;
      }
      const next = returnToLobby(session);
      commitSession(next);
      multiplayer.send({ type: 'STATE_UPDATE', state: next });
    },

    leaveActiveGame: () => {
      void clearSessionIdentity();
      set({
        session: null,
        isHost: false,
        isSolo: false,
        connectionStatus: 'idle',
        hostPresent: true,
        toast: null,
        relayJoinCode: null,
      });
    },

    dispatchAction: (action) => {
      const { session, isHost, localPlayerId } = get();
      if (!session || session.phase !== 'playing') {
        return;
      }
      if (isHost) {
        const result = applyAction(session, localPlayerId, action);
        if (result.ok) {
          commitSession(result.state);
          multiplayer.send({ type: 'STATE_UPDATE', state: result.state });
        } else {
          const rejected = rejectAction(session, localPlayerId, result.reason);
          commitSession(rejected, { toast: result.reason });
        }
        return;
      }
      multiplayer.send({ type: 'ACTION', playerId: localPlayerId, action });
    },

    clearToast: () => set({ toast: null }),
  };
});
