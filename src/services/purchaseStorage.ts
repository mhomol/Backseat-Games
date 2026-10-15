import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_ENTITLEMENT, type EntitlementCache } from '../types/purchases';
import { uniquePaidThemes } from '../utils/themeEntitlement';

const STORAGE_KEY = 'backseat-games.host-entitlement';

function mergeWithDefaults(partial: Partial<EntitlementCache> | null): EntitlementCache {
  if (!partial) {
    return { ...DEFAULT_ENTITLEMENT };
  }
  return {
    hostUnlocked: partial.hostUnlocked ?? false,
    ownedThemeIds: uniquePaidThemes(partial.ownedThemeIds ?? []),
    lastVerifiedAt: partial.lastVerifiedAt ?? null,
  };
}

export async function loadHostEntitlementCache(): Promise<EntitlementCache> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_ENTITLEMENT };
    }
    return mergeWithDefaults(JSON.parse(raw) as Partial<EntitlementCache>);
  } catch {
    return { ...DEFAULT_ENTITLEMENT };
  }
}

export async function saveHostEntitlementCache(cache: EntitlementCache): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Non-fatal — entitlement falls back to StoreKit on next launch.
  }
}

export const loadEntitlementCache = loadHostEntitlementCache;
export const saveEntitlementCache = saveHostEntitlementCache;
