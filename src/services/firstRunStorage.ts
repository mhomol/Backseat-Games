import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'backseat-games.first-run-teaching-seen';

export async function hasSeenFirstRunTeaching(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    return value === '1';
  } catch {
    return false;
  }
}

export async function markFirstRunTeachingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Non-fatal.
  }
}
