import { create } from 'zustand';
import { HOST_UNLOCK_FALLBACK_PRICE, THEME_FALLBACK_PRICE } from '../types/purchases';
import type { PaidThemeId, ThemeId } from '../types/theme';
import {
  initHostUnlockIap,
  isIapSupported,
  purchaseHostUnlock,
  purchaseTheme,
  restoreAllPurchases,
  type ThemePriceMap,
} from '../services/iapService';
import { canHost } from '../utils/hostEntitlement';
import { mergeOwnedThemes, ownsTheme } from '../utils/themeEntitlement';

interface PurchaseStore {
  hostUnlocked: boolean;
  ownedThemeIds: PaidThemeId[];
  loaded: boolean;
  busy: boolean;
  productPrice: string;
  themePrices: ThemePriceMap;
  loadEntitlement: () => Promise<void>;
  purchaseHostUnlock: () => Promise<{ success: boolean; cancelled?: boolean }>;
  purchaseTheme: (themeId: PaidThemeId) => Promise<{ success: boolean; cancelled?: boolean }>;
  restorePurchases: () => Promise<boolean>;
  canHost: () => boolean;
  requiresPurchase: () => boolean;
  ownsTheme: (themeId: ThemeId) => boolean;
  themePrice: (themeId: PaidThemeId) => string;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  hostUnlocked: __DEV__ || !isIapSupported(),
  ownedThemeIds: __DEV__ ? ['thanksgiving', 'christmas'] : [],
  loaded: false,
  busy: false,
  productPrice: HOST_UNLOCK_FALLBACK_PRICE,
  themePrices: {
    thanksgiving: THEME_FALLBACK_PRICE,
    christmas: THEME_FALLBACK_PRICE,
  },

  loadEntitlement: async () => {
    const result = await initHostUnlockIap();
    set({
      hostUnlocked: result.hostUnlocked,
      ownedThemeIds: result.ownedThemeIds,
      productPrice: result.productPrice,
      themePrices: result.themePrices,
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

  purchaseTheme: async (themeId) => {
    set({ busy: true });
    try {
      const result = await purchaseTheme(themeId);
      if (result.success) {
        set({ ownedThemeIds: mergeOwnedThemes(get().ownedThemeIds, [themeId]) });
      }
      return result;
    } finally {
      set({ busy: false });
    }
  },

  restorePurchases: async () => {
    set({ busy: true });
    try {
      const restored = await restoreAllPurchases();
      set({
        hostUnlocked: restored.hostUnlocked,
        ownedThemeIds: restored.ownedThemeIds,
      });
      return restored.hostUnlocked || restored.ownedThemeIds.length > 0;
    } finally {
      set({ busy: false });
    }
  },

  canHost: () => canHost({ hostUnlocked: get().hostUnlocked }),

  requiresPurchase: () => isIapSupported() && !get().hostUnlocked,

  ownsTheme: (themeId) => ownsTheme(themeId, get().ownedThemeIds),

  themePrice: (themeId) => get().themePrices[themeId] ?? THEME_FALLBACK_PRICE,
}));
