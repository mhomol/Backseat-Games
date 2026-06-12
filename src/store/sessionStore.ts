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
  addPlayer,
  applyAction,
  createSession,
  finishGame,
  rejectAction,
  returnToLobby,
  startGame,
} from '../games/ruleEngine';
import { getMultiplayerService } from '../multiplayer';
import { loadSavedPlayerName, savePlayerName } from '../services/playerNameStorage';
import { usePreferencesStore } from './preferencesStore';
import { usePurchaseStore } from './purchaseStore';
import { useStatsStore } from './statsStore';
import type { GameRules } from '../types/preferences';

interface SessionStore {
  localPlayerId: string;
  localPlayerName: string;
  isHost: boolean;
  session: SessionState | null;
  discoveredSessions: Array<{
    sessionId: string;
    hostName: string;
    gameType: GameType | null;
  }>;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'error';
  toast: string | null;
  initialized: boolean;

  initialize: () => Promise<void>;
  reset: () => void;
  setLocalName: (name: string) => void;
  hostGame: (gameType: GameType, hostName: string) => Promise<string>;
  refreshDiscovery: () => void;
  joinDiscoveredSession: (sessionId: string, playerName: string) => Promise<void>;
  startHostedGame: () => void;
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
  let unsubscribeDiscovery: (() => void) | null = null;

  const multiplayer = getMultiplayerService();

  const commitSession = (
    nextSession: SessionState,
    extra?: Partial<Pick<SessionStore, 'connectionStatus' | 'localPlayerId' | 'toast'>>,
  ) => {
    const previousSession = get().session;
    useStatsStore
      .getState()
      .recordFinishedSession(previousSession, nextSession, get().localPlayerId);
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
        const joiner = playerFromLocal(joinerId, message.name, false);
        const nextSession = addPlayer(state.session, joiner);
        commitSession(nextSession);
        multiplayer.send({
          type: 'WELCOME',
          playerId: joinerId,
          state: nextSession,
        });
        multiplayer.send({
          type: 'PLAYER_JOINED',
          player: joiner,
          state: nextSession,
        });
        break;
      }
      case 'WELCOME': {
        // Joiners only — the host sends WELCOME and must keep their own player id.
        if (!state.isHost && message.playerId) {
          commitSession(message.state, {
            localPlayerId: message.playerId,
            connectionStatus: 'connected',
          });
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
    session: null,
    discoveredSessions: [],
    connectionStatus: 'idle',
    toast: null,
    initialized: false,

    initialize: async () => {
      if (get().initialized) {
        return;
      }
      await multiplayer.initialize();
      unsubscribeMessages = multiplayer.onMessage(handleNetworkMessage);
      const savedName = await loadSavedPlayerName();
      if (savedName) {
        set({ localPlayerName: savedName });
      }
      set({ initialized: true });
    },

    reset: () => {
      unsubscribeMessages?.();
      unsubscribeDiscovery?.();
      unsubscribeMessages = null;
      unsubscribeDiscovery = null;
      set({
        session: null,
        isHost: false,
        discoveredSessions: [],
        connectionStatus: 'idle',
        toast: null,
        localPlayerId: uuidv4(),
      });
    },

    setLocalName: (name: string) => {
      set({ localPlayerName: name });
      void savePlayerName(name);
    },

    hostGame: async (gameType, hostName) => {
      if (!usePurchaseStore.getState().canHost()) {
        set({ toast: 'Host unlock required to start a game.' });
        throw new Error('Host unlock required');
      }

      const sessionId = uuidv4().slice(0, 8);
      const hostId = get().localPlayerId;
      const host = playerFromLocal(hostId, hostName, true);
      const gameRules = usePreferencesStore.getState().getDefaultGameRules();
      const session = createSession(sessionId, host, gameType, gameRules);
      await multiplayer.hostSession(sessionId, hostName, gameType);
      void savePlayerName(hostName);
      set({
        isHost: true,
        localPlayerName: hostName,
        session,
        connectionStatus: 'connected',
      });
      return sessionId;
    },

    refreshDiscovery: () => {
      unsubscribeDiscovery?.();
      set({ discoveredSessions: [] });
      unsubscribeDiscovery = multiplayer.browseSessions((found) => {
        const state = get();
        if (state.isHost && state.session?.sessionId === found.sessionId) {
          return;
        }
        set((current) => {
          const existingIndex = current.discoveredSessions.findIndex(
            (entry) => entry.sessionId === found.sessionId,
          );
          if (existingIndex >= 0) {
            const next = [...current.discoveredSessions];
            next[existingIndex] = found;
            return { discoveredSessions: next };
          }
          return {
            discoveredSessions: [...current.discoveredSessions, found],
          };
        });
      });
    },

    joinDiscoveredSession: async (sessionId, playerName) => {
      const trimmed = playerName.trim();
      void savePlayerName(trimmed);
      set({ connectionStatus: 'connecting', localPlayerName: trimmed, isHost: false });
      try {
        await multiplayer.joinSession(sessionId, trimmed);
      } catch (error) {
        set({
          connectionStatus: 'error',
          toast: error instanceof Error ? error.message : 'Could not join that game.',
        });
        throw error;
      }
    },

    startHostedGame: () => {
      const { session, isHost } = get();
      if (!isHost || !session) {
        return;
      }
      const next = startGame(session);
      commitSession(next);
      multiplayer.send({ type: 'START_GAME', gameType: next.gameType!, state: next });
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
      set({
        session: null,
        isHost: false,
        connectionStatus: 'idle',
        toast: null,
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
