import { Platform } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import {
  initSession,
  PeerState,
  type MPCSession,
  type RNPeer,
} from 'react-native-multipeer-connectivity';
import { v4 as uuidv4 } from 'uuid';
import type { GameType, NetworkMessage } from '../types/game';
import type { DiscoveryHandler, MessageHandler, MultiplayerService } from './types';
import { MC_SERVICE_TYPE } from './types';
import { createMockMultiplayerService } from './MockMultiplayerService';

type DiscoveredHost = {
  peer: RNPeer;
  sessionId: string;
  hostName: string;
  gameType: GameType | null;
};

function parseGameType(value: string | undefined): GameType | null {
  if (value === 'license-plates' || value === 'bingo' || value === 'sign-game') {
    return value;
  }
  return null;
}

function parseDiscoveryInfo(info?: Record<string, string>) {
  if (!info?.sessionId || !info.hostName) {
    return null;
  }
  return {
    sessionId: info.sessionId,
    hostName: info.hostName,
    gameType: parseGameType(info.gameType),
  };
}

class MultipeerService implements MultiplayerService {
  readonly mode = 'native' as const;

  private fallback = createMockMultiplayerService();
  private useFallback = Platform.OS !== 'ios';
  private mpc: MPCSession | null = null;
  private subscriptions: EmitterSubscription[] = [];
  private messageHandler: MessageHandler | null = null;
  private discoveryHandler: DiscoveryHandler | null = null;
  private discoveredHosts = new Map<string, DiscoveredHost>();
  private connectedPeerIds = new Set<string>();
  private hosting = false;
  private sessionId: string | null = null;
  private displayName = 'Player';
  private gameType: GameType | null = null;
  private localPeerId = uuidv4();
  private pendingJoinName: string | null = null;
  private pendingJoinPeerId: string | null = null;
  private joinWaiters = new Set<(ok: boolean) => void>();

  async initialize(): Promise<void> {
    if (this.useFallback) {
      await this.fallback.initialize();
      return;
    }
  }

  dispose(): void {
    if (this.useFallback) {
      this.fallback.dispose();
      return;
    }
    void this.stopAll();
    this.teardownSession();
  }

  async hostSession(
    sessionId: string,
    displayName: string,
    gameType: GameType | null = null,
  ): Promise<void> {
    if (this.useFallback) {
      await this.fallback.hostSession(sessionId, displayName, gameType);
      return;
    }

    this.hosting = true;
    this.sessionId = sessionId;
    this.displayName = displayName;
    this.gameType = gameType;
    this.pendingJoinName = null;
    this.pendingJoinPeerId = null;

    await this.stopAll();
    this.startSession(displayName, {
      sessionId,
      hostName: displayName,
      gameType: gameType ?? '',
    });
    await this.mpc!.advertize();
  }

  async joinSession(sessionId: string, displayName: string): Promise<void> {
    if (this.useFallback) {
      await this.fallback.joinSession(sessionId, displayName);
      return;
    }

    const host = this.discoveredHosts.get(sessionId);
    if (!host) {
      throw new Error('That game is no longer visible nearby.');
    }

    this.hosting = false;
    this.sessionId = sessionId;
    this.displayName = displayName;
    this.pendingJoinName = displayName;
    this.pendingJoinPeerId = host.peer.id;

    return new Promise((resolve, reject) => {
      const finish = (error?: Error) => {
        clearTimeout(timeout);
        this.joinWaiters.delete(onConnected);
        if (error) {
          this.pendingJoinName = null;
          this.pendingJoinPeerId = null;
          reject(error);
          return;
        }
        resolve();
      };

      const onConnected = (ok: boolean) => {
        finish(ok ? undefined : new Error('Could not join that game.'));
      };

      this.joinWaiters.add(onConnected);
      const timeout = setTimeout(() => {
        finish(new Error('Join timed out. Make sure the host still has the app open.'));
      }, 30_000);

      void this.mpc!
        .invite({ peerID: host.peer.id, timeout: 30 })
        .catch((error: unknown) => {
          finish(error instanceof Error ? error : new Error('Invite failed.'));
        });
    });
  }

  browseSessions(onDiscovered: DiscoveryHandler): () => void {
    if (this.useFallback) {
      return this.fallback.browseSessions(onDiscovered);
    }

    this.discoveryHandler = onDiscovered;
    void this.ensureBrowseSession().then(() => this.mpc?.browse());

    return () => {
      this.discoveryHandler = null;
      void this.mpc?.stopBrowsing();
    };
  }

  send(message: NetworkMessage): void {
    if (this.useFallback) {
      this.fallback.send(message);
      return;
    }

    const payload = JSON.stringify(message);
    for (const peerId of this.connectedPeerIds) {
      void this.mpc?.sendText(peerId, payload);
    }
  }

  onMessage(handler: MessageHandler): () => void {
    if (this.useFallback) {
      return this.fallback.onMessage(handler);
    }

    this.messageHandler = handler;
    return () => {
      if (this.messageHandler === handler) {
        this.messageHandler = null;
      }
    };
  }

  getLocalPeerId(): string {
    return this.useFallback ? this.fallback.getLocalPeerId() : this.localPeerId;
  }

  isHost(): boolean {
    return this.useFallback ? this.fallback.isHost() : this.hosting;
  }

  registerHostedSessionGameType(sessionId: string, gameType: GameType | null): void {
    if (this.useFallback) {
      this.fallback.registerHostedSessionGameType(sessionId, gameType);
      return;
    }
    if (!this.hosting || this.sessionId !== sessionId) {
      return;
    }
    this.gameType = gameType;
    void this.refreshHostAdvertisement();
  }

  private async ensureBrowseSession(): Promise<void> {
    if (this.hosting) {
      return;
    }
    if (!this.mpc) {
      this.startSession(this.displayName);
    }
    await this.mpc?.stopAdvertizing();
  }

  private async refreshHostAdvertisement(): Promise<void> {
    if (!this.hosting || !this.sessionId) {
      return;
    }
    await this.mpc?.stopAdvertizing();
    this.startSession(this.displayName, {
      sessionId: this.sessionId,
      hostName: this.displayName,
      gameType: this.gameType ?? '',
    });
    await this.mpc!.advertize();
  }

  private startSession(displayName: string, discoveryInfo?: Record<string, string>) {
    this.teardownSession();
    this.mpc = initSession({
      displayName,
      serviceType: MC_SERVICE_TYPE,
      discoveryInfo,
    });
    this.attachSessionListeners();
  }

  private attachSessionListeners() {
    if (!this.mpc) {
      return;
    }

    this.subscriptions.push(
      this.mpc.onReceivedPeerInvitation(({ handler }) => {
        void handler(true);
      }),
      this.mpc.onFoundPeer((event) => {
        const parsed = parseDiscoveryInfo(event.discoveryInfo);
        if (!parsed) {
          return;
        }
        this.discoveredHosts.set(parsed.sessionId, {
          peer: event.peer,
          ...parsed,
        });
        this.discoveryHandler?.(parsed);
      }),
      this.mpc.onLostPeer((event) => {
        for (const [sessionId, host] of this.discoveredHosts.entries()) {
          if (host.peer.id === event.peer.id) {
            this.discoveredHosts.delete(sessionId);
          }
        }
      }),
      this.mpc.onPeerStateChanged((event) => {
        if (event.state === PeerState.connected) {
          this.connectedPeerIds.add(event.peer.id);
          if (
            !this.hosting &&
            this.pendingJoinName &&
            this.pendingJoinPeerId === event.peer.id
          ) {
            const joinMessage: NetworkMessage = {
              type: 'JOIN',
              name: this.pendingJoinName,
            };
            void this.mpc
              ?.sendText(event.peer.id, JSON.stringify(joinMessage))
              .then(() => {
                for (const settle of this.joinWaiters) {
                  settle(true);
                }
                this.joinWaiters.clear();
                this.pendingJoinName = null;
                this.pendingJoinPeerId = null;
              })
              .catch(() => {
                for (const settle of this.joinWaiters) {
                  settle(false);
                }
                this.joinWaiters.clear();
              });
          }
          return;
        }

        if (event.state === PeerState.notConnected) {
          this.connectedPeerIds.delete(event.peer.id);
        }
      }),
      this.mpc.onReceivedText((event) => {
        try {
          const parsed = JSON.parse(event.text) as NetworkMessage;
          this.messageHandler?.(parsed, event.peer.id);
        } catch {
          // Ignore malformed payloads.
        }
      }),
      this.mpc.onStartAdvertisingError(({ text }) => {
        console.error('Multipeer advertise error:', text);
      }),
      this.mpc.onStartBrowsingError(({ text }) => {
        console.error('Multipeer browse error:', text);
      }),
    );
  }

  private async stopAll() {
    await this.mpc?.stopBrowsing();
    await this.mpc?.stopAdvertizing();
  }

  private teardownSession() {
    for (const subscription of this.subscriptions) {
      subscription.remove();
    }
    this.subscriptions = [];
    this.connectedPeerIds.clear();
    this.mpc = null;
  }
}

export function createNativeMultipeerService(): MultiplayerService {
  return new MultipeerService();
}
