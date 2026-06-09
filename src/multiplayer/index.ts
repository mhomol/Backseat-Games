import Constants from 'expo-constants';
import type { DiscoveryHandler, MessageHandler, MultiplayerService } from './types';
import { createMockMultiplayerService, MockMultiplayerService } from './MockMultiplayerService';
import type { NetworkMessage } from '../types/game';

/**
 * Native Multipeer adapter for EAS development/production builds.
 * Falls back to MockMultiplayerService in Expo Go where native MPC is unavailable.
 */
export class NativeMultiplayerService implements MultiplayerService {
  readonly mode: 'mock' | 'native';
  private delegate: MultiplayerService;
  private mockDelegate: MockMultiplayerService | null = null;

  constructor() {
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      this.mockDelegate = createMockMultiplayerService();
      this.delegate = this.mockDelegate;
      this.mode = 'mock';
    } else {
      this.delegate = createNativeAdapter();
      this.mode = 'native';
    }
  }

  initialize(): Promise<void> {
    return this.delegate.initialize();
  }

  dispose(): void {
    this.delegate.dispose();
  }

  hostSession(sessionId: string, displayName: string): Promise<void> {
    return this.delegate.hostSession(sessionId, displayName);
  }

  joinSession(sessionId: string, displayName: string): Promise<void> {
    return this.delegate.joinSession(sessionId, displayName);
  }

  browseSessions(onDiscovered: DiscoveryHandler): () => void {
    return this.delegate.browseSessions(onDiscovered);
  }

  send(message: NetworkMessage): void {
    this.delegate.send(message);
  }

  onMessage(handler: MessageHandler): () => void {
    return this.delegate.onMessage(handler);
  }

  getLocalPeerId(): string {
    return this.delegate.getLocalPeerId();
  }

  isHost(): boolean {
    return this.delegate.isHost();
  }

  registerHostedSessionGameType(sessionId: string, gameType: string | null) {
    this.mockDelegate?.registerHostedSessionGameType(sessionId, gameType);
  }
}

function createNativeAdapter(): MultiplayerService {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Multipeer = require('./NativeMultipeerBridge');
    return Multipeer.createNativeMultipeerService();
  } catch {
    const mock = createMockMultiplayerService();
    return mock;
  }
}

let singleton: NativeMultiplayerService | null = null;

export function getMultiplayerService(): NativeMultiplayerService {
  if (!singleton) {
    singleton = new NativeMultiplayerService();
  }
  return singleton;
}

export function resetMultiplayerService(): void {
  singleton?.dispose();
  singleton = null;
}
