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
  };
}

export function clonePreferences(preferences: AppPreferences): AppPreferences {
  return {
    ...preferences,
    gameRules: cloneGameRules(preferences.gameRules),
  };
}
