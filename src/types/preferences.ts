import type { GameType } from './game';

export type QxzMatchMode = 'anywhere' | 'starts-with';

export type BingoWinMode = 'line' | 'blackout';

export interface SignGameRules {
  qxzMatchMode: QxzMatchMode;
  allowDuplicateWords: boolean;
  enableRecordings: boolean;
}

export interface LicensePlatesRules {
  allowUnclaim: boolean;
}

export interface BingoRules {
  winMode: BingoWinMode;
}

export interface HangmanRules {
  maxMisses: number;
  pointsToWin: number;
}

export interface ColorCatchRules {
  winMode: BingoWinMode;
}

export interface GameRules {
  'sign-game': SignGameRules;
  'license-plates': LicensePlatesRules;
  bingo: BingoRules;
  hangman: HangmanRules;
  'color-catch': ColorCatchRules;
}

export interface AppPreferences {
  gameRules: GameRules;
  soundEffectsEnabled: boolean;
  hapticsEnabled: boolean;
  /** Cold-start opening jingle on Home. Independent of sound effects. */
  introJingleEnabled: boolean;
}

export type GameRulesSlice<T extends GameType> = GameRules[T];
