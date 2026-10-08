import type { GameRules, HangmanDifficulty } from './preferences';

export type GameType =
  | 'license-plates'
  | 'bingo'
  | 'sign-game'
  | 'hangman'
  | 'color-catch';

export const ALL_GAME_TYPES: GameType[] = [
  'license-plates',
  'sign-game',
  'bingo',
  'hangman',
  'color-catch',
];

export function isGameType(value: string | null | undefined): value is GameType {
  return (
    value === 'license-plates' ||
    value === 'bingo' ||
    value === 'sign-game' ||
    value === 'hangman' ||
    value === 'color-catch'
  );
}

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
  | SignGameState
  | HangmanState
  | ColorCatchState;

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

export type HangmanRoundPhase = 'awaiting-secret' | 'guessing' | 'match-over';

export interface HangmanState {
  type: 'hangman';
  mode: 'solo' | 'versus';
  round: number;
  supplierId: string | null;
  guesserId: string;
  secretWord: string | null;
  displayMask: string;
  guessedLetters: string[];
  missCount: number;
  maxMisses: number;
  scores: Record<string, number>;
  roundPhase: HangmanRoundPhase;
  winnerId: string | null;
  soloDifficulty: HangmanDifficulty | null;
}

export interface ColorCatchState {
  type: 'color-catch';
  cards: Record<string, BingoCard>;
  marked: Record<string, boolean[]>;
  winnerId: string | null;
}

export type GameAction =
  | { type: 'CLAIM_PLATE'; plateCode: string }
  | { type: 'UNCLAIM_PLATE'; plateCode: string }
  | { type: 'MARK_BINGO'; index: number }
  | { type: 'UNMARK_BINGO'; index: number }
  | { type: 'SUBMIT_SIGN_WORD'; letter: string; word: string; audioUri?: string }
  | { type: 'SUBMIT_HANGMAN_SECRET'; phrase: string }
  | { type: 'GUESS_HANGMAN_LETTER'; letter: string }
  | { type: 'MARK_COLOR_CATCH'; index: number }
  | { type: 'UNMARK_COLOR_CATCH'; index: number };

export type NetworkMessage =
  | { type: 'JOIN'; name: string }
  | { type: 'WELCOME'; playerId: string; state: SessionState }
  | { type: 'PLAYER_JOINED'; player: Player; state: SessionState }
  | { type: 'PLAYER_LEFT'; playerId: string; state: SessionState }
  | { type: 'START_GAME'; gameType: GameType; state: SessionState }
  | { type: 'STATE_UPDATE'; state: SessionState }
  | { type: 'ACTION'; playerId: string; action: GameAction }
  | { type: 'ACTION_REJECTED'; playerId: string; reason: string }
  | { type: 'JOIN_REJECTED'; reason: string; playerId?: string }
  | { type: 'SESSION_DISCOVERED'; sessionId: string; hostName: string; gameType: GameType | null };

export interface Plate {
  code: string;
  name: string;
  region: 'US' | 'CA';
  tint: string;
  /** Landmark used for scene art prompts (not shown in UI). */
  landmark: string;
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
