import { Platform } from 'react-native';
import {
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  restorePurchases,
  type Product,
  type Purchase,
} from 'expo-iap';
import {
  ALL_IAP_SKUS,
  HOST_UNLOCK_FALLBACK_PRICE,
  HOST_UNLOCK_PRODUCT_ID,
  THEME_FALLBACK_PRICE,
  type EntitlementCache,
} from '../types/purchases';
import type { PaidThemeId } from '../types/theme';
import { hasHostUnlockPurchase } from '../utils/hostEntitlement';
import {
  mergeOwnedThemes,
  ownedThemesFromPurchases,
  paidThemeIdForProduct,
  productIdForPaidTheme,
} from '../utils/themeEntitlement';
import { loadHostEntitlementCache, saveHostEntitlementCache } from './purchaseStorage';

export type ThemePriceMap = Record<PaidThemeId, string>;

export type IapInitResult = {
  hostUnlocked: boolean;
  productPrice: string;
  ownedThemeIds: PaidThemeId[];
  themePrices: ThemePriceMap;
};

const DEFAULT_THEME_PRICES: ThemePriceMap = {
  halloween: THEME_FALLBACK_PRICE,
  thanksgiving: THEME_FALLBACK_PRICE,
  christmas: THEME_FALLBACK_PRICE,
};

let connected = false;
let listenersAttached = false;
let pendingPurchaseResolve: ((success: boolean) => void) | null = null;

function isUserCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const code = 'code' in error ? String(error.code) : '';
  return code.includes('UserCancelled') || code.includes('E_USER_CANCELLED');
}

function formatProductPrice(product: Product | undefined, fallback: string): string {
  if (!product) {
    return fallback;
  }
  if ('displayPrice' in product && typeof product.displayPrice === 'string') {
    return product.displayPrice;
  }
  if ('localizedPrice' in product && typeof product.localizedPrice === 'string') {
    return product.localizedPrice;
  }
  return fallback;
}

function productSku(product: Product): string {
  if ('id' in product && typeof product.id === 'string') {
    return product.id;
  }
  if ('productId' in product && typeof product.productId === 'string') {
    return product.productId;
  }
  return '';
}

function pricesFromProducts(products: Product[] | undefined): {
  hostPrice: string;
  themePrices: ThemePriceMap;
} {
  const list = products ?? [];
  const bySku = new Map(list.map((product) => [productSku(product), product]));
  const host = bySku.get(HOST_UNLOCK_PRODUCT_ID);
  return {
    hostPrice: formatProductPrice(host as Product | undefined, HOST_UNLOCK_FALLBACK_PRICE),
    themePrices: {
      halloween: formatProductPrice(
        bySku.get(productIdForPaidTheme('halloween')) as Product | undefined,
        THEME_FALLBACK_PRICE,
      ),
      thanksgiving: formatProductPrice(
        bySku.get(productIdForPaidTheme('thanksgiving')) as Product | undefined,
        THEME_FALLBACK_PRICE,
      ),
      christmas: formatProductPrice(
        bySku.get(productIdForPaidTheme('christmas')) as Product | undefined,
        THEME_FALLBACK_PRICE,
      ),
    },
  };
}

async function fetchIapProducts(): Promise<Product[]> {
  const products = await fetchProducts({
    skus: [...ALL_IAP_SKUS],
    type: 'in-app',
  });
  return (products ?? []) as Product[];
}

async function readStorePurchases(): Promise<Purchase[]> {
  const purchases = await getAvailablePurchases({
    alsoPublishToEventListenerIOS: false,
    onlyIncludeActiveItemsIOS: true,
  });
  return purchases ?? [];
}

async function persistEntitlement(partial: Partial<EntitlementCache>): Promise<EntitlementCache> {
  const current = await loadHostEntitlementCache();
  const cache: EntitlementCache = {
    hostUnlocked: partial.hostUnlocked ?? current.hostUnlocked,
    ownedThemeIds: partial.ownedThemeIds ?? current.ownedThemeIds,
    lastVerifiedAt: new Date().toISOString(),
  };
  await saveHostEntitlementCache(cache);
  return cache;
}

async function applyPurchasesToCache(purchases: ReadonlyArray<Purchase>): Promise<EntitlementCache> {
  const cached = await loadHostEntitlementCache();
  const hostUnlocked = cached.hostUnlocked || hasHostUnlockPurchase(purchases, HOST_UNLOCK_PRODUCT_ID);
  const ownedThemeIds = mergeOwnedThemes(cached.ownedThemeIds, ownedThemesFromPurchases(purchases));
  return persistEntitlement({ hostUnlocked, ownedThemeIds });
}

async function handlePurchaseUpdate(purchase: Purchase): Promise<void> {
  const isHost = purchase.productId === HOST_UNLOCK_PRODUCT_ID;
  const themeId = paidThemeIdForProduct(purchase.productId ?? '');
  if (!isHost && !themeId) {
    return;
  }

  try {
    await finishTransaction({ purchase, isConsumable: false });
    const cached = await loadHostEntitlementCache();
    await persistEntitlement({
      hostUnlocked: isHost ? true : cached.hostUnlocked,
      ownedThemeIds: themeId
        ? mergeOwnedThemes(cached.ownedThemeIds, [themeId])
        : cached.ownedThemeIds,
    });
    pendingPurchaseResolve?.(true);
  } catch (error) {
    console.error('Failed to finish purchase', error);
    pendingPurchaseResolve?.(false);
  } finally {
    pendingPurchaseResolve = null;
  }
}

function attachListeners(): void {
  if (listenersAttached) {
    return;
  }
  purchaseUpdatedListener((purchase) => {
    void handlePurchaseUpdate(purchase);
  });
  purchaseErrorListener((error) => {
    if (!isUserCancelled(error)) {
      console.error('IAP purchase error', error);
    }
    pendingPurchaseResolve?.(false);
    pendingPurchaseResolve = null;
  });
  listenersAttached = true;
}

export function isIapSupported(): boolean {
  return Platform.OS === 'ios' && !__DEV__;
}

export async function initHostUnlockIap(): Promise<IapInitResult> {
  const cached = await loadHostEntitlementCache();

  if (Platform.OS !== 'ios') {
    return {
      hostUnlocked: true,
      productPrice: HOST_UNLOCK_FALLBACK_PRICE,
      ownedThemeIds: cached.ownedThemeIds,
      themePrices: DEFAULT_THEME_PRICES,
    };
  }

  if (__DEV__) {
    return {
      hostUnlocked: true,
      productPrice: HOST_UNLOCK_FALLBACK_PRICE,
      ownedThemeIds: ['halloween', 'thanksgiving', 'christmas'],
      themePrices: DEFAULT_THEME_PRICES,
    };
  }

  try {
    if (!connected) {
      await initConnection();
      connected = true;
      attachListeners();
    }

    const products = await fetchIapProducts();
    const { hostPrice, themePrices } = pricesFromProducts(products);
    const purchases = await readStorePurchases();
    const next = await applyPurchasesToCache(purchases);

    return {
      hostUnlocked: next.hostUnlocked,
      productPrice: hostPrice,
      ownedThemeIds: next.ownedThemeIds,
      themePrices,
    };
  } catch (error) {
    console.error('IAP init failed', error);
    return {
      hostUnlocked: cached.hostUnlocked,
      productPrice: HOST_UNLOCK_FALLBACK_PRICE,
      ownedThemeIds: cached.ownedThemeIds,
      themePrices: DEFAULT_THEME_PRICES,
    };
  }
}

async function purchaseSku(sku: string): Promise<{ success: boolean; cancelled?: boolean }> {
  if (Platform.OS !== 'ios' || __DEV__) {
    return { success: true };
  }

  return new Promise((resolve) => {
    pendingPurchaseResolve = (success) => resolve({ success });

    void (async () => {
      try {
        if (!connected) {
          await initConnection();
          connected = true;
          attachListeners();
        }

        const result = await requestPurchase({
          request: {
            apple: { sku },
          },
          type: 'in-app',
        });

        if (result && !Array.isArray(result) && result.productId === sku) {
          await handlePurchaseUpdate(result);
          return;
        }

        if (Array.isArray(result)) {
          const match = result.find((purchase) => purchase.productId === sku);
          if (match) {
            await handlePurchaseUpdate(match);
            return;
          }
        }

        const purchases = await readStorePurchases();
        const owned = purchases.some((purchase) => purchase.productId === sku);
        if (owned) {
          await applyPurchasesToCache(purchases);
          pendingPurchaseResolve?.(true);
          pendingPurchaseResolve = null;
          return;
        }

        pendingPurchaseResolve?.(false);
        pendingPurchaseResolve = null;
      } catch (error) {
        if (isUserCancelled(error)) {
          pendingPurchaseResolve = null;
          resolve({ success: false, cancelled: true });
          return;
        }
        console.error('Purchase failed', error);
        pendingPurchaseResolve?.(false);
        pendingPurchaseResolve = null;
      }
    })();
  });
}

export async function purchaseHostUnlock(): Promise<{ success: boolean; cancelled?: boolean }> {
  const result = await purchaseSku(HOST_UNLOCK_PRODUCT_ID);
  if (Platform.OS === 'ios' && __DEV__ && result.success) {
    await persistEntitlement({ hostUnlocked: true });
  }
  return result;
}

export async function purchaseTheme(
  themeId: PaidThemeId,
): Promise<{ success: boolean; cancelled?: boolean }> {
  const result = await purchaseSku(productIdForPaidTheme(themeId));
  if (Platform.OS === 'ios' && __DEV__ && result.success) {
    const cached = await loadHostEntitlementCache();
    await persistEntitlement({
      ownedThemeIds: mergeOwnedThemes(cached.ownedThemeIds, [themeId]),
    });
  }
  return result;
}

export async function restoreHostUnlock(): Promise<boolean> {
  const result = await restoreAllPurchases();
  return result.hostUnlocked;
}

export async function restoreAllPurchases(): Promise<{
  hostUnlocked: boolean;
  ownedThemeIds: PaidThemeId[];
}> {
  if (Platform.OS !== 'ios') {
    const cached = await loadHostEntitlementCache();
    return { hostUnlocked: cached.hostUnlocked, ownedThemeIds: cached.ownedThemeIds };
  }
  if (__DEV__) {
    return {
      hostUnlocked: true,
      ownedThemeIds: ['halloween', 'thanksgiving', 'christmas'],
    };
  }

  try {
    if (!connected) {
      await initConnection();
      connected = true;
      attachListeners();
    }

    await restorePurchases();
    const purchases = await readStorePurchases();
    const next = await applyPurchasesToCache(purchases);
    return { hostUnlocked: next.hostUnlocked, ownedThemeIds: next.ownedThemeIds };
  } catch (error) {
    console.error('Restore purchases failed', error);
    const cached = await loadHostEntitlementCache();
    return { hostUnlocked: cached.hostUnlocked, ownedThemeIds: cached.ownedThemeIds };
  }
}
