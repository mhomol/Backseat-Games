import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'backseat-games.plate-collection';

export async function loadSpottedPlates(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((code): code is string => typeof code === 'string');
  } catch {
    return [];
  }
}

export async function saveSpottedPlates(codes: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  } catch {
    // Non-fatal.
  }
}

export function mergeSpottedPlates(existing: string[], incoming: string[]): string[] {
  const next = new Set(existing);
  for (const code of incoming) {
    next.add(code);
  }
  return [...next].sort();
}
