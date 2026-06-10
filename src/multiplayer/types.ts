import type { GameType, NetworkMessage } from '../types/game';

export type MessageHandler = (message: NetworkMessage, fromPeerId?: string) => void;
export type DiscoveryHandler = (session: {
  sessionId: string;
  hostName: string;
  gameType: GameType | null;
}) => void;

export interface MultiplayerService {
  readonly mode: 'mock' | 'native';
  initialize(): Promise<void>;
  dispose(): void;
  hostSession(
    sessionId: string,
    displayName: string,
    gameType?: GameType | null,
  ): Promise<void>;
  joinSession(sessionId: string, displayName: string): Promise<void>;
  browseSessions(onDiscovered: DiscoveryHandler): () => void;
  send(message: NetworkMessage): void;
  onMessage(handler: MessageHandler): () => void;
  getLocalPeerId(): string;
  isHost(): boolean;
  registerHostedSessionGameType?(sessionId: string, gameType: GameType | null): void;
}

/** Bonjour service name (matches NSBonjourServices `_backseatgames._tcp`). */
export const MC_SERVICE_TYPE = 'backseatgames';
export const SERVICE_NAME = 'BackseatGames';
