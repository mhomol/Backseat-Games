import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeHangmanPhrase } from '../games/hangman';

const STORAGE_KEY = 'backseat-games.hangman-solved';

export async function loadHangmanSolved(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((entry): entry is string => typeof entry === 'string')
      .map(normalizeHangmanPhrase)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function saveHangmanSolved(phrases: string[]): Promise<void> {
  try {
    const unique = [...new Set(phrases.map(normalizeHangmanPhrase).filter(Boolean))].sort();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  } catch {
    // Non-fatal.
  }
}

export async function markHangmanSolved(phrase: string): Promise<void> {
  const normalized = normalizeHangmanPhrase(phrase);
  if (!normalized) {
    return;
  }
  const existing = await loadHangmanSolved();
  if (existing.includes(normalized)) {
    return;
  }
  await saveHangmanSolved([...existing, normalized]);
}
