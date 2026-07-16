type CanHostParams = {
  hostUnlocked: boolean;
  isDev?: boolean;
};

/** Platform-aware host check — pass `platform` in tests to avoid React Native. */
export function canHostForPlatform(
  platform: string,
  { hostUnlocked, isDev = __DEV__ }: CanHostParams,
): boolean {
  if (platform !== 'ios') {
    return true;
  }
  if (isDev) {
    return true;
  }
  return hostUnlocked;
}

/** Whether this device may start a hosted session. */
export function canHost(params: CanHostParams): boolean {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Platform } = require('react-native') as typeof import('react-native');
  return canHostForPlatform(Platform.OS, params);
}

/**
 * Solo offline play is free. Online hosting (join codes / waiting room) requires unlock.
 */
export function canStartHostedSession(params: { solo: boolean; canHost: boolean }): boolean {
  return params.solo || params.canHost;
}

/** Merge local cache with a fresh StoreKit entitlement check. */
export function mergeHostEntitlement(cachedUnlocked: boolean, storeKitUnlocked: boolean): boolean {
  return cachedUnlocked || storeKitUnlocked;
}

/** True when StoreKit purchases include the host unlock SKU. */
export function hasHostUnlockPurchase(
  purchases: ReadonlyArray<{ productId?: string | null }>,
  productId: string,
): boolean {
  return purchases.some((purchase) => purchase.productId === productId);
}
