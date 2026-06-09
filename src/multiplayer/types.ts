import type { NetworkMessage } from '../types/game';

export type MessageHandler = (message: NetworkMessage, fromPeerId?: string) => void;
export type DiscoveryHandler = (session: {
  sessionId: string;
  hostName: string;
  gameType: import('../types/game').GameType | null;
}) => void;

export interface MultiplayerService {
  readonly mode: 'mock' | 'native';
  initialize(): Promise<void>;
  dispose(): void;
  hostSession(sessionId: string, displayName: string): Promise<void>;
  joinSession(sessionId: string, displayName: string): Promise<void>;
  browseSessions(onDiscovered: DiscoveryHandler): () => void;
  send(message: NetworkMessage): void;
  onMessage(handler: MessageHandler): () => void;
  getLocalPeerId(): string;
  isHost(): boolean;
}

export const SERVICE_TYPE = '_backseatgames._tcp';
export const SERVICE_NAME = 'BackseatGames';
