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

export interface GameRules {
  'sign-game': SignGameRules;
  'license-plates': LicensePlatesRules;
  bingo: BingoRules;
}

export interface AppPreferences {
  gameRules: GameRules;
  soundEffectsEnabled: boolean;
  hapticsEnabled: boolean;
}

export type GameRulesSlice<T extends GameType> = GameRules[T];
