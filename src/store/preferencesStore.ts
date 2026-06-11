import { create } from 'zustand';
import {
  cloneGameRules,
  clonePreferences,
  DEFAULT_PREFERENCES,
} from '../data/defaultPreferences';
import { loadPreferences, savePreferences } from '../services/preferencesStorage';
import type { AppPreferences, GameRules } from '../types/preferences';

interface PreferencesStore {
  preferences: AppPreferences;
  loaded: boolean;
  loadPreferences: () => Promise<void>;
  updatePreferences: (partial: Partial<AppPreferences>) => void;
  updateGameRules: (partial: Partial<GameRules>) => void;
  getDefaultGameRules: () => GameRules;
}

export const usePreferencesStore = create<PreferencesStore>((set, get) => ({
  preferences: clonePreferences(DEFAULT_PREFERENCES),
  loaded: false,

  loadPreferences: async () => {
    const preferences = await loadPreferences();
    set({ preferences, loaded: true });
  },

  updatePreferences: (partial) => {
    const next = clonePreferences({
      ...get().preferences,
      ...partial,
      gameRules: partial.gameRules
        ? {
            ...get().preferences.gameRules,
            ...partial.gameRules,
            'sign-game': {
              ...get().preferences.gameRules['sign-game'],
              ...partial.gameRules['sign-game'],
            },
            'license-plates': {
              ...get().preferences.gameRules['license-plates'],
              ...partial.gameRules['license-plates'],
            },
            bingo: {
              ...get().preferences.gameRules.bingo,
              ...partial.gameRules.bingo,
            },
          }
        : get().preferences.gameRules,
    });
    set({ preferences: next });
    void savePreferences(next);
  },

  updateGameRules: (partial) => {
    get().updatePreferences({
      gameRules: {
        ...get().preferences.gameRules,
        ...partial,
      },
    });
  },

  getDefaultGameRules: () => cloneGameRules(get().preferences.gameRules),
}));
