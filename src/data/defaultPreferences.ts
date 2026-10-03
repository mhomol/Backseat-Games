import type { AppPreferences, GameRules } from '../types/preferences';

export const DEFAULT_GAME_RULES: GameRules = {
  'sign-game': {
    qxzMatchMode: 'anywhere',
    allowDuplicateWords: false,
    enableRecordings: false,
  },
  'license-plates': {
    allowUnclaim: true,
  },
  bingo: {
    winMode: 'line',
  },
  hangman: {
    maxMisses: 6,
    pointsToWin: 5,
  },
  'color-catch': {
    winMode: 'line',
  },
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  gameRules: DEFAULT_GAME_RULES,
  soundEffectsEnabled: true,
  hapticsEnabled: true,
  introJingleEnabled: true,
};

export function cloneGameRules(rules: GameRules): GameRules {
  return {
    'sign-game': { ...rules['sign-game'] },
    'license-plates': { ...rules['license-plates'] },
    bingo: { ...rules.bingo },
    hangman: { ...rules.hangman },
    'color-catch': { ...rules['color-catch'] },
  };
}

export function mergeGameRules(
  base: GameRules,
  partial: Partial<GameRules> | undefined,
): GameRules {
  return {
    'sign-game': { ...base['sign-game'], ...partial?.['sign-game'] },
    'license-plates': { ...base['license-plates'], ...partial?.['license-plates'] },
    bingo: { ...base.bingo, ...partial?.bingo },
    hangman: { ...base.hangman, ...partial?.hangman },
    'color-catch': { ...base['color-catch'], ...partial?.['color-catch'] },
  };
}

export function clonePreferences(preferences: AppPreferences): AppPreferences {
  return {
    ...preferences,
    gameRules: cloneGameRules(preferences.gameRules),
  };
}
