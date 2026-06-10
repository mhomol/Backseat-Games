import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'backseat-games.player-name';

export async function loadSavedPlayerName(): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value?.trim() || null;
  } catch {
    return null;
  }
}

export async function savePlayerName(name: string): Promise<void> {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return;
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
  } catch {
    // Non-fatal — game still works without persistence.
  }
}
