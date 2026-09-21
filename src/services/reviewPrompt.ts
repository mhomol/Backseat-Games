import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { shouldPromptReview } from './reviewPromptLogic';

const STORAGE_KEY = 'backseat-games.last-review-prompt';

export { REVIEW_COOLDOWN_MS, shouldPromptReview } from './reviewPromptLogic';

export async function maybeRequestReview(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const available = await StoreReview.isAvailableAsync();
    if (!available) {
      return;
    }

    const lastRaw = await AsyncStorage.getItem(STORAGE_KEY);
    const last = lastRaw ? Number(lastRaw) : null;
    if (!shouldPromptReview(Number.isFinite(last) ? last : null, Date.now())) {
      return;
    }

    await StoreReview.requestReview();
    await AsyncStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Review prompt is optional growth polish.
  }
}
