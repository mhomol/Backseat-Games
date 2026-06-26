import { Platform } from 'react-native';
import Constants from 'expo-constants';
import type { GameType, NetworkMessage } from '../types/game';
import type { DiscoveryHandler, MessageHandler, MultiplayerService, ConnectionChangeHandler } from './types';
import { createMockMultiplayerService } from './MockMultiplayerService';
import { createRelayMultiplayerService, RelayMultiplayerService } from './RelayMultiplayerService';
import { isJoinCode } from '../constants/relay';

type MpcService = MultiplayerService & {
  registerHostedSessionGameType?(sessionId: string, gameType: GameType | null): void;
};

/**
 * iOS: Multipeer browse/join when possible, plus always-on relay room for join codes.
 * Android: relay join codes. Expo Go: mock MPC only for local dev.
 */
export class HybridMultiplayerService implements MultiplayerService {
  readonly mode = 'hybrid' as const;

  private mpc: MpcService;
  private relay: RelayMultiplayerService;
  private useMpc: boolean;
  private useRelay: boolean;
  private active: 'mpc' | 'relay' = 'relay';
  private messageHandler: MessageHandler | null = null;
  private discoveryHandler: DiscoveryHandler | null = null;
  private mpcUnsubscribe: (() => void) | null = null;
  private relayUnsubscribe: (() => void) | null = null;

  constructor(mpc: MpcService, relay: RelayMultiplayerService, useMpc: boolean, useRelay: boolean) {
    this.mpc = mpc;
    this.relay = relay;
    this.useMpc = useMpc;
    this.useRelay = useRelay;
  }

  get activeTransport(): 'mpc' | 'relay' {
    return this.active;
  }

  getJoinCode(): string | null {
    return this.useRelay ? this.relay.getJoinCode() : null;
  }

  getRelaySessionId(): string | null {
    return this.relay.getRelaySessionId();
  }

  async initialize(): Promise<void> {
    const tasks: Promise<void>[] = [this.mpc.initialize()];
    if (this.useRelay) {
      tasks.push(this.relay.initialize());
    }
    await Promise.all(tasks);
  }

  dispose(): void {
    this.mpcUnsubscribe?.();
    this.relayUnsubscribe?.();
    this.mpc.dispose();
    this.relay.dispose();
    this.messageHandler = null;
    this.discoveryHandler = null;
  }

  async hostSession(
    sessionId: string,
    displayName: string,
    gameType: GameType | null = null,
  ): Promise<void> {
    if (!this.useRelay) {
      await this.mpc.hostSession(sessionId, displayName, gameType);
      this.active = 'mpc';
      return;
    }

    let relayReady = false;
    try {
      await this.relay.hostSession(sessionId, displayName, gameType);
      relayReady = true;
    } catch {
      if (!this.useMpc) {
        throw new Error(
          'Could not create an online room. Check your internet connection and try again.',
        );
      }
    }

    if (this.useMpc) {
      await this.mpc.hostSession(sessionId, displayName, gameType).catch(() => {
        // Nearby hosting is optional when relay is available.
      });
    }

    this.active = relayReady ? 'relay' : 'mpc';
  }

  async joinSession(sessionId: string, displayName: string): Promise<void> {
    if (isJoinCode(sessionId)) {
      if (!this.useRelay) {
        throw new Error('Online join is not available in this build.');
      }
      this.active = 'relay';
      await this.relay.joinByCode(sessionId, displayName);
      return;
    }

    if (!this.useMpc) {
      if (!this.useRelay) {
        this.active = 'mpc';
        await this.mpc.joinSession(sessionId, displayName);
        return;
      }
      throw new Error('Enter the host join code to play online.');
    }

    try {
      this.active = 'mpc';
      await this.mpc.joinSession(sessionId, displayName);
    } catch (error) {
      this.active = 'relay';
      throw error;
    }
  }

  async joinByCode(joinCode: string, displayName: string): Promise<string> {
    if (!this.useRelay) {
      throw new Error('Online join is not available in this build.');
    }
    this.active = 'relay';
    return this.relay.joinByCode(joinCode, displayName);
  }

  browseSessions(onDiscovered: DiscoveryHandler): () => void {
    this.discoveryHandler = onDiscovered;
    if (!this.useMpc) {
      return () => {
        this.discoveryHandler = null;
      };
    }

    return this.mpc.browseSessions((session) => {
      this.discoveryHandler?.(session);
    });
  }

  send(message: NetworkMessage): void {
    if (this.active === 'mpc') {
      this.mpc.send(message);
      return;
    }

    this.relay.send(message);
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandler = handler;

    const dispatch = (message: NetworkMessage, fromPeerId?: string) => {
      this.messageHandler?.(message, fromPeerId);
    };

    this.mpcUnsubscribe?.();
    this.relayUnsubscribe?.();

    this.mpcUnsubscribe = this.mpc.onMessage(dispatch);
    if (this.useRelay) {
      this.relayUnsubscribe = this.relay.onMessage(dispatch);
    }

    return () => {
      if (this.messageHandler === handler) {
        this.mpcUnsubscribe?.();
        this.relayUnsubscribe?.();
        this.mpcUnsubscribe = null;
        this.relayUnsubscribe = null;
        this.messageHandler = null;
      }
    };
  }

  getLocalPeerId(): string {
    return this.active === 'mpc' ? this.mpc.getLocalPeerId() : this.relay.getLocalPeerId();
  }

  isHost(): boolean {
    if (this.active === 'mpc') {
      return this.mpc.isHost();
    }
    return this.useRelay ? this.relay.isHost() : this.mpc.isHost();
  }

  registerHostedSessionGameType(sessionId: string, gameType: GameType | null): void {
    this.mpc.registerHostedSessionGameType?.(sessionId, gameType);
    this.relay.registerHostedSessionGameType(sessionId, gameType);
  }

  setLocalPeerId(peerId: string): void {
    this.relay.setLocalPeerId(peerId);
    this.mpc.setLocalPeerId?.(peerId);
  }

  onConnectionChange(handler: ConnectionChangeHandler): () => void {
    if (!this.useRelay) {
      return () => {};
    }
    return this.relay.onConnectionChange(handler);
  }
}

export function createHybridMultiplayerService(): HybridMultiplayerService {
  const isExpoGo = Constants.appOwnership === 'expo';
  const useMpc = Platform.OS === 'ios' && !isExpoGo;
  const useRelay = !isExpoGo;

  let mpc: MpcService;
  if (isExpoGo) {
    mpc = createMockMultiplayerService();
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Multipeer = require('./NativeMultipeerBridge');
      mpc = Multipeer.createNativeMultipeerService();
    } catch {
      mpc = createMockMultiplayerService();
    }
  }

  return new HybridMultiplayerService(mpc, createRelayMultiplayerService(), useMpc, useRelay);
}
