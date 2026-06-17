import { v4 as uuidv4 } from 'uuid';
import type { NetworkMessage } from '../types/game';
import type { DiscoveryHandler, MessageHandler, MultiplayerService } from './types';

type MockPeer = {
  id: string;
  name: string;
  isHost: boolean;
  sessionId: string | null;
};

const mockRegistry = new Map<string, MockPeer>();
const mockSessions = new Map<string, { hostId: string; hostName: string; gameType: string | null }>();
const mockSubscribers = new Map<string, Set<(message: NetworkMessage) => void>>();

function broadcast(sessionId: string, message: NetworkMessage, excludePeerId?: string) {
  for (const [peerId, peer] of mockRegistry.entries()) {
    if (peer.sessionId !== sessionId || peerId === excludePeerId) {
      continue;
    }
    const handlers = mockSubscribers.get(peerId);
    if (handlers) {
      for (const handler of handlers) {
        handler(message);
      }
    }
  }
}

export class MockMultiplayerService implements MultiplayerService {
  readonly mode = 'mock' as const;

  private peerId = uuidv4();
  private peerName = 'Player';
  private hosting = false;
  private sessionId: string | null = null;
  private messageHandler: MessageHandler | null = null;
  private discoveryHandler: DiscoveryHandler | null = null;
  private discoveryInterval: ReturnType<typeof setInterval> | null = null;

  async initialize(): Promise<void> {
    mockRegistry.set(this.peerId, {
      id: this.peerId,
      name: this.peerName,
      isHost: false,
      sessionId: null,
    });
    mockSubscribers.set(this.peerId, new Set());
  }

  dispose(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }
    mockRegistry.delete(this.peerId);
    mockSubscribers.delete(this.peerId);
    if (this.hosting && this.sessionId) {
      mockSessions.delete(this.sessionId);
    }
  }

  async hostSession(
    sessionId: string,
    displayName: string,
    gameType: import('../types/game').GameType | null = null,
  ): Promise<void> {
    this.peerName = displayName;
    this.sessionId = sessionId;
    this.hosting = true;
    mockRegistry.set(this.peerId, {
      id: this.peerId,
      name: displayName,
      isHost: true,
      sessionId,
    });
    mockSessions.set(sessionId, {
      hostId: this.peerId,
      hostName: displayName,
      gameType,
    });
  }

  async joinSession(sessionId: string, displayName: string): Promise<void> {
    this.peerName = displayName;
    this.sessionId = sessionId;
    this.hosting = false;
    mockRegistry.set(this.peerId, {
      id: this.peerId,
      name: displayName,
      isHost: false,
      sessionId,
    });
    this.messageHandler?.({ type: 'JOIN', name: displayName }, this.peerId);
    broadcast(sessionId, { type: 'JOIN', name: displayName }, this.peerId);
  }

  browseSessions(onDiscovered: DiscoveryHandler): () => void {
    this.discoveryHandler = onDiscovered;
    const publish = () => {
      for (const [sessionId, session] of mockSessions.entries()) {
        onDiscovered({
          sessionId,
          hostName: session.hostName,
          gameType: session.gameType as import('../types/game').GameType | null,
        });
      }
    };
    publish();
    this.discoveryInterval = setInterval(publish, 2000);
    return () => {
      if (this.discoveryInterval) {
        clearInterval(this.discoveryInterval);
        this.discoveryInterval = null;
      }
    };
  }

  send(message: NetworkMessage): void {
    if (!this.sessionId) {
      return;
    }
    if (this.hosting) {
      broadcast(this.sessionId, message);
      this.messageHandler?.(message, this.peerId);
      return;
    }
    const session = mockSessions.get(this.sessionId);
    if (!session) {
      return;
    }
    const hostHandlers = mockSubscribers.get(session.hostId);
    if (hostHandlers) {
      for (const handler of hostHandlers) {
        handler(message);
      }
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandler = handler;
    const set = mockSubscribers.get(this.peerId) ?? new Set();
    const wrapped = (message: NetworkMessage) => handler(message);
    set.add(wrapped);
    mockSubscribers.set(this.peerId, set);
    return () => {
      set.delete(wrapped);
    };
  }

  getLocalPeerId(): string {
    return this.peerId;
  }

  isHost(): boolean {
    return this.hosting;
  }

  getJoinCode(): string | null {
    return null;
  }

  registerHostedSessionGameType(sessionId: string, gameType: string | null) {
    const session = mockSessions.get(sessionId);
    if (session) {
      mockSessions.set(sessionId, { ...session, gameType });
    }
  }
}

export function createMockMultiplayerService(): MockMultiplayerService {
  return new MockMultiplayerService();
}
