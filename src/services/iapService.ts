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
  HOST_UNLOCK_FALLBACK_PRICE,
  HOST_UNLOCK_PRODUCT_ID,
  type HostEntitlementCache,
} from '../types/purchases';
import { hasHostUnlockPurchase } from '../utils/hostEntitlement';
import { loadHostEntitlementCache, saveHostEntitlementCache } from './purchaseStorage';

export type IapInitResult = {
  hostUnlocked: boolean;
  productPrice: string;
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

function formatProductPrice(product: Product | undefined): string {
  if (!product) {
    return HOST_UNLOCK_FALLBACK_PRICE;
  }
  if ('displayPrice' in product && typeof product.displayPrice === 'string') {
    return product.displayPrice;
  }
  if ('localizedPrice' in product && typeof product.localizedPrice === 'string') {
    return product.localizedPrice;
  }
  return HOST_UNLOCK_FALLBACK_PRICE;
}

async function fetchHostProduct(): Promise<Product | undefined> {
  const products = await fetchProducts({
    skus: [HOST_UNLOCK_PRODUCT_ID],
    type: 'in-app',
  });
  return products?.[0] as Product | undefined;
}

async function readStoreKitEntitlement(): Promise<boolean> {
  const purchases = await getAvailablePurchases({
    alsoPublishToEventListenerIOS: false,
    onlyIncludeActiveItemsIOS: true,
  });
  return hasHostUnlockPurchase(purchases, HOST_UNLOCK_PRODUCT_ID);
}

async function persistUnlocked(): Promise<HostEntitlementCache> {
  const cache: HostEntitlementCache = {
    hostUnlocked: true,
    lastVerifiedAt: new Date().toISOString(),
  };
  await saveHostEntitlementCache(cache);
  return cache;
}

async function handlePurchaseUpdate(purchase: Purchase): Promise<void> {
  if (purchase.productId !== HOST_UNLOCK_PRODUCT_ID) {
    return;
  }

  try {
    await finishTransaction({ purchase, isConsumable: false });
    await persistUnlocked();
    pendingPurchaseResolve?.(true);
  } catch (error) {
    console.error('Failed to finish host unlock purchase', error);
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
      console.error('Host unlock purchase error', error);
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
    return { hostUnlocked: true, productPrice: HOST_UNLOCK_FALLBACK_PRICE };
  }

  if (__DEV__) {
    return { hostUnlocked: true, productPrice: HOST_UNLOCK_FALLBACK_PRICE };
  }

  try {
    if (!connected) {
      await initConnection();
      connected = true;
      attachListeners();
    }

    const product = await fetchHostProduct();
    const storeKitUnlocked = await readStoreKitEntitlement();
    const hostUnlocked = cached.hostUnlocked || storeKitUnlocked;

    if (storeKitUnlocked && !cached.hostUnlocked) {
      await persistUnlocked();
    }

    return {
      hostUnlocked,
      productPrice: formatProductPrice(product),
    };
  } catch (error) {
    console.error('IAP init failed', error);
    return {
      hostUnlocked: cached.hostUnlocked,
      productPrice: HOST_UNLOCK_FALLBACK_PRICE,
    };
  }
}

export async function purchaseHostUnlock(): Promise<{ success: boolean; cancelled?: boolean }> {
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
            apple: { sku: HOST_UNLOCK_PRODUCT_ID },
          },
          type: 'in-app',
        });

        if (result && !Array.isArray(result) && result.productId === HOST_UNLOCK_PRODUCT_ID) {
          await handlePurchaseUpdate(result);
          return;
        }

        if (Array.isArray(result)) {
          const match = result.find((purchase) => purchase.productId === HOST_UNLOCK_PRODUCT_ID);
          if (match) {
            await handlePurchaseUpdate(match);
            return;
          }
        }

        const storeKitUnlocked = await readStoreKitEntitlement();
        if (storeKitUnlocked) {
          await persistUnlocked();
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
        console.error('Host unlock purchase failed', error);
        pendingPurchaseResolve?.(false);
        pendingPurchaseResolve = null;
      }
    })();
  });
}

export async function restoreHostUnlock(): Promise<boolean> {
  if (Platform.OS !== 'ios' || __DEV__) {
    return true;
  }

  try {
    if (!connected) {
      await initConnection();
      connected = true;
      attachListeners();
    }

    await restorePurchases();
    const unlocked = await readStoreKitEntitlement();
    if (unlocked) {
      await persistUnlocked();
    }
    return unlocked;
  } catch (error) {
    console.error('Restore purchases failed', error);
    const cached = await loadHostEntitlementCache();
    return cached.hostUnlocked;
  }
}
