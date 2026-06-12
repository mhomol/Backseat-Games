import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_HOST_ENTITLEMENT,
  type HostEntitlementCache,
} from '../types/purchases';

const STORAGE_KEY = 'backseat-games.host-entitlement';

function mergeWithDefaults(partial: Partial<HostEntitlementCache> | null): HostEntitlementCache {
  if (!partial) {
    return { ...DEFAULT_HOST_ENTITLEMENT };
  }
  return {
    hostUnlocked: partial.hostUnlocked ?? false,
    lastVerifiedAt: partial.lastVerifiedAt ?? null,
  };
}

export async function loadHostEntitlementCache(): Promise<HostEntitlementCache> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_HOST_ENTITLEMENT };
    }
    return mergeWithDefaults(JSON.parse(raw) as Partial<HostEntitlementCache>);
  } catch {
    return { ...DEFAULT_HOST_ENTITLEMENT };
  }
}

export async function saveHostEntitlementCache(cache: HostEntitlementCache): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Non-fatal — entitlement falls back to StoreKit on next launch.
  }
}
