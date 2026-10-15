import type { PaidThemeId } from './theme';

/** Non-consumable IAP — unlock hosting on this Apple ID. */
export const HOST_UNLOCK_PRODUCT_ID = 'com.homolworks.backseatgames.host_unlock';

export const THANKSGIVING_THEME_PRODUCT_ID =
  'com.homolworks.backseatgames.theme_thanksgiving';

export const CHRISTMAS_THEME_PRODUCT_ID = 'com.homolworks.backseatgames.theme_christmas';

/** Fallback when StoreKit price is unavailable (must match App Store Connect tier). */
export const HOST_UNLOCK_FALLBACK_PRICE = '$0.99';

export const THEME_FALLBACK_PRICE = '$0.99';

export const PAID_THEME_PRODUCT_IDS: Record<PaidThemeId, string> = {
  thanksgiving: THANKSGIVING_THEME_PRODUCT_ID,
  christmas: CHRISTMAS_THEME_PRODUCT_ID,
};

export const ALL_IAP_SKUS = [
  HOST_UNLOCK_PRODUCT_ID,
  THANKSGIVING_THEME_PRODUCT_ID,
  CHRISTMAS_THEME_PRODUCT_ID,
] as const;

export type EntitlementCache = {
  hostUnlocked: boolean;
  ownedThemeIds: PaidThemeId[];
  lastVerifiedAt: string | null;
};

export const DEFAULT_ENTITLEMENT: EntitlementCache = {
  hostUnlocked: false,
  ownedThemeIds: [],
  lastVerifiedAt: null,
};

/** @deprecated Use EntitlementCache */
export type HostEntitlementCache = EntitlementCache;
export const DEFAULT_HOST_ENTITLEMENT = DEFAULT_ENTITLEMENT;
