/** Non-consumable IAP — unlock hosting on this Apple ID. */
export const HOST_UNLOCK_PRODUCT_ID = 'com.homolworks.backseatgames.host_unlock';

/** Fallback when StoreKit price is unavailable (must match App Store Connect tier). */
export const HOST_UNLOCK_FALLBACK_PRICE = '$0.99';

export type HostEntitlementCache = {
  hostUnlocked: boolean;
  lastVerifiedAt: string | null;
};

export const DEFAULT_HOST_ENTITLEMENT: HostEntitlementCache = {
  hostUnlocked: false,
  lastVerifiedAt: null,
};
