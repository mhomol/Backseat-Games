import { getThemePack, type ThemePack } from '@/data/themes';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSessionStore } from '@/store/sessionStore';
import type { ThemeId } from '@/types/theme';
import { isThemeId } from '@/types/theme';
import { resolveSelectableTheme } from '@/utils/themeEntitlement';

/** Session look while in a trip; otherwise the owned Settings selection. */
export function useResolvedThemeId(): ThemeId {
  const sessionTheme = useSessionStore((state) => state.session?.themeId);
  const selected = usePreferencesStore((state) => state.preferences.selectedThemeId);
  const ownedThemeIds = usePurchaseStore((state) => state.ownedThemeIds);

  if (isThemeId(sessionTheme)) {
    return sessionTheme;
  }
  return resolveSelectableTheme(selected, ownedThemeIds);
}

export function useThemePack(): ThemePack {
  return getThemePack(useResolvedThemeId());
}
