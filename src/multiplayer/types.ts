import type { GameType, NetworkMessage } from '../types/game';

export type MultiplayerMode = 'mock' | 'native' | 'relay' | 'hybrid';
export type MultiplayerTransport = 'mpc' | 'relay';

export type MessageHandler = (message: NetworkMessage, fromPeerId?: string) => void;
export type DiscoveryHandler = (session: {
  sessionId: string;
  hostName: string;
  gameType: GameType | null;
}) => void;

export type ConnectionChangeHandler = (
  status: 'connected' | 'reconnecting' | 'disconnected',
) => void;

export interface MultiplayerService {
  readonly mode: MultiplayerMode;
  readonly activeTransport?: MultiplayerTransport;
  initialize(): Promise<void>;
  dispose(): void;
  hostSession(
    sessionId: string,
    displayName: string,
    gameType?: GameType | null,
  ): Promise<void>;
  joinSession(sessionId: string, displayName: string): Promise<void>;
  /** Join via relay join code; returns canonical session id for navigation. */
  joinByCode?(joinCode: string, displayName: string): Promise<string>;
  browseSessions(onDiscovered: DiscoveryHandler): () => void;
  send(message: NetworkMessage): void;
  onMessage(handler: MessageHandler): () => void;
  getLocalPeerId(): string;
  isHost(): boolean;
  getJoinCode(): string | null;
  registerHostedSessionGameType?(sessionId: string, gameType: GameType | null): void;
  setLocalPeerId?(peerId: string): void;
  onConnectionChange?(handler: ConnectionChangeHandler): () => void;
}

/** Bonjour service name (matches NSBonjourServices `_backseatgames._tcp`). */
export const MC_SERVICE_TYPE = 'backseatgames';
export const SERVICE_NAME = 'BackseatGames';
