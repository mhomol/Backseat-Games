import type { GameRules } from './preferences';

export type GameType = 'license-plates' | 'bingo' | 'sign-game';

export type SessionPhase = 'lobby' | 'playing' | 'finished';

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
}

export interface SessionState {
  sessionId: string;
  phase: SessionPhase;
  gameType: GameType | null;
  players: Player[];
  hostId: string;
  gameRules: GameRules;
  gameState: GameState | null;
  winnerId: string | null;
  lastRejection: { playerId: string; reason: string } | null;
}

export type GameState =
  | LicensePlatesState
  | BingoState
  | SignGameState;

export interface LicensePlatesState {
  type: 'license-plates';
  claims: Record<string, string | null>;
}

export interface BingoState {
  type: 'bingo';
  cards: Record<string, BingoCard>;
  marked: Record<string, boolean[]>;
  winnerId: string | null;
}

export interface BingoCard {
  itemIds: string[];
  freeCenter: true;
}

export interface SignGameState {
  type: 'sign-game';
  playerLetters: Record<string, string>;
  usedWords: string[];
  submissions: SignSubmission[];
  winnerId: string | null;
}

export interface SignSubmission {
  playerId: string;
  letter: string;
  word: string;
  audioUri?: string;
  timestamp: number;
}

export type GameAction =
  | { type: 'CLAIM_PLATE'; plateCode: string }
  | { type: 'UNCLAIM_PLATE'; plateCode: string }
  | { type: 'MARK_BINGO'; index: number }
  | { type: 'UNMARK_BINGO'; index: number }
  | { type: 'SUBMIT_SIGN_WORD'; letter: string; word: string; audioUri?: string };

export type NetworkMessage =
  | { type: 'JOIN'; name: string }
  | { type: 'WELCOME'; playerId: string; state: SessionState }
  | { type: 'PLAYER_JOINED'; player: Player; state: SessionState }
  | { type: 'PLAYER_LEFT'; playerId: string; state: SessionState }
  | { type: 'START_GAME'; gameType: GameType; state: SessionState }
  | { type: 'STATE_UPDATE'; state: SessionState }
  | { type: 'ACTION'; playerId: string; action: GameAction }
  | { type: 'ACTION_REJECTED'; playerId: string; reason: string }
  | { type: 'SESSION_DISCOVERED'; sessionId: string; hostName: string; gameType: GameType | null };

export interface Plate {
  code: string;
  name: string;
  region: 'US' | 'CA';
  tint: string;
}

export interface BingoItem {
  id: string;
  label: string;
  icon: string;
  category: string;
}

export type ApplyResult =
  | { ok: true; state: SessionState }
  | { ok: false; reason: string };
