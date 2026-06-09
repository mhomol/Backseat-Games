import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import type { NetworkMessage } from '../types/game';
import type { DiscoveryHandler, MessageHandler, MultiplayerService } from './types';
import { SERVICE_NAME, SERVICE_TYPE } from './types';
import { createMockMultiplayerService } from './MockMultiplayerService';

type NativeModule = {
  startAdvertising: (peerName: string, serviceType: string) => Promise<void>;
  stopAdvertising: () => Promise<void>;
  startBrowsing: (serviceType: string) => Promise<void>;
  stopBrowsing: () => Promise<void>;
  invitePeer: (peerId: string) => Promise<void>;
  sendMessage: (peerId: string, message: string) => Promise<void>;
  broadcastMessage: (message: string) => Promise<void>;
  addListener: (
    event: string,
    callback: (payload: Record<string, string>) => void,
  ) => { remove: () => void };
};

function loadNativeModule(): NativeModule | null {
  if (Platform.OS !== 'ios') {
    return null;
  }
  try {
    // Optional native module installed in dev/prod builds via config plugin.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-multipeer-connectivity').default as NativeModule;
  } catch {
    return null;
  }
}

class MultipeerService implements MultiplayerService {
  readonly mode = 'native' as const;
  private native = loadNativeModule();
  private fallback = createMockMultiplayerService();
  private useFallback = !this.native;
  private peerId = uuidv4();
  private hosting = false;
  private sessionId: string | null = null;
  private messageHandler: MessageHandler | null = null;
  private connectedPeers = new Set<string>();

  private get active(): MultiplayerService {
    return this.useFallback ? this.fallback : (this as unknown as MultiplayerService);
  }

  async initialize(): Promise<void> {
    if (this.useFallback) {
      await this.fallback.initialize();
      return;
    }
    this.native!.addListener('onPeerConnected', (payload) => {
      if (payload.peerId) {
        this.connectedPeers.add(payload.peerId);
      }
    });
    this.native!.addListener('onPeerDisconnected', (payload) => {
      if (payload.peerId) {
        this.connectedPeers.delete(payload.peerId);
      }
    });
    this.native!.addListener('onMessageReceived', (payload) => {
      if (!payload.message || !this.messageHandler) {
        return;
      }
      try {
        const parsed = JSON.parse(payload.message) as NetworkMessage;
        this.messageHandler(parsed, payload.peerId);
      } catch {
        // ignore malformed messages
      }
    });
    this.native!.addListener('onPeerFound', (payload) => {
      if (payload.peerId && payload.info) {
        try {
          const info = JSON.parse(payload.info) as {
            sessionId: string;
            hostName: string;
            gameType: string | null;
          };
          this.discoveryCallback?.({
            sessionId: info.sessionId,
            hostName: info.hostName,
            gameType: info.gameType as import('../types/game').GameType | null,
          });
        } catch {
          // ignore
        }
      }
    });
  }

  private discoveryCallback: DiscoveryHandler | null = null;

  dispose(): void {
    if (this.useFallback) {
      this.fallback.dispose();
      return;
    }
    void this.native?.stopAdvertising();
    void this.native?.stopBrowsing();
  }

  async hostSession(sessionId: string, displayName: string): Promise<void> {
    this.sessionId = sessionId;
    this.hosting = true;
    if (this.useFallback) {
      await this.fallback.hostSession(sessionId, displayName);
      return;
    }
    await this.native!.startAdvertising(
      JSON.stringify({ sessionId, hostName: displayName, gameType: null }),
      SERVICE_TYPE,
    );
  }

  async joinSession(sessionId: string, displayName: string): Promise<void> {
    this.sessionId = sessionId;
    this.hosting = false;
    if (this.useFallback) {
      await this.fallback.joinSession(sessionId, displayName);
      return;
    }
    await this.native!.startBrowsing(SERVICE_TYPE);
    this.peerId = displayName;
  }

  browseSessions(onDiscovered: DiscoveryHandler): () => void {
    this.discoveryCallback = onDiscovered;
    if (this.useFallback) {
      return this.fallback.browseSessions(onDiscovered);
    }
    void this.native!.startBrowsing(SERVICE_TYPE);
    return () => {
      void this.native?.stopBrowsing();
    };
  }

  send(message: NetworkMessage): void {
    if (this.useFallback) {
      this.fallback.send(message);
      return;
    }
    const payload = JSON.stringify(message);
    if (this.hosting) {
      void this.native!.broadcastMessage(payload);
      this.messageHandler?.(message, this.peerId);
      return;
    }
    void this.native!.broadcastMessage(payload);
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandler = handler;
    if (this.useFallback) {
      return this.fallback.onMessage(handler);
    }
    return () => {
      this.messageHandler = null;
    };
  }

  getLocalPeerId(): string {
    return this.useFallback ? this.fallback.getLocalPeerId() : this.peerId;
  }

  isHost(): boolean {
    return this.hosting;
  }
}

export function createNativeMultipeerService(): MultiplayerService {
  const service = new MultipeerService();
  return service;
}

export { SERVICE_NAME, SERVICE_TYPE };
