import { create } from 'zustand';
import { HOST_UNLOCK_FALLBACK_PRICE } from '../types/purchases';
import {
  initHostUnlockIap,
  isIapSupported,
  purchaseHostUnlock,
  restoreHostUnlock,
} from '../services/iapService';
import { canHost } from '../utils/hostEntitlement';

interface PurchaseStore {
  hostUnlocked: boolean;
  loaded: boolean;
  busy: boolean;
  productPrice: string;
  loadEntitlement: () => Promise<void>;
  purchaseHostUnlock: () => Promise<{ success: boolean; cancelled?: boolean }>;
  restorePurchases: () => Promise<boolean>;
  canHost: () => boolean;
  requiresPurchase: () => boolean;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  hostUnlocked: __DEV__ || !isIapSupported(),
  loaded: false,
  busy: false,
  productPrice: HOST_UNLOCK_FALLBACK_PRICE,

  loadEntitlement: async () => {
    const result = await initHostUnlockIap();
    set({
      hostUnlocked: result.hostUnlocked,
      productPrice: result.productPrice,
      loaded: true,
    });
  },

  purchaseHostUnlock: async () => {
    set({ busy: true });
    try {
      const result = await purchaseHostUnlock();
      if (result.success) {
        set({ hostUnlocked: true });
      }
      return result;
    } finally {
      set({ busy: false });
    }
  },

  restorePurchases: async () => {
    set({ busy: true });
    try {
      const restored = await restoreHostUnlock();
      if (restored) {
        set({ hostUnlocked: true });
      }
      return restored;
    } finally {
      set({ busy: false });
    }
  },

  canHost: () => canHost({ hostUnlocked: get().hostUnlocked }),

  requiresPurchase: () => isIapSupported() && !get().hostUnlocked,
}));
