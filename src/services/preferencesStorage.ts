import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clonePreferences,
  DEFAULT_PREFERENCES,
  mergeGameRules,
} from '../data/defaultPreferences';
import type { AppPreferences } from '../types/preferences';

const STORAGE_KEY = 'backseat-games.preferences';

function mergeWithDefaults(partial: Partial<AppPreferences> | null): AppPreferences {
  if (!partial) {
    return clonePreferences(DEFAULT_PREFERENCES);
  }

  return clonePreferences({
    ...DEFAULT_PREFERENCES,
    ...partial,
    gameRules: mergeGameRules(DEFAULT_PREFERENCES.gameRules, partial.gameRules),
  });
}

export async function loadPreferences(): Promise<AppPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return clonePreferences(DEFAULT_PREFERENCES);
    }
    return mergeWithDefaults(JSON.parse(raw) as Partial<AppPreferences>);
  } catch {
    return clonePreferences(DEFAULT_PREFERENCES);
  }
}

export async function savePreferences(preferences: AppPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Non-fatal — app falls back to in-memory defaults.
  }
}
