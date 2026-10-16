import { getThemePack, type ThemePack } from '@/data/themes';
import { usePreferencesStore } from '@/store/preferencesStore';
import { usePurchaseStore } from '@/store/purchaseStore';
import { useSessionStore } from '@/store/sessionStore';
import { colors } from '@/theme';
import type { ThemeId } from '@/types/theme';
import { isThemeId } from '@/types/theme';
import { skyLuminance } from '@/utils/skyChrome';
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

/** Copy that sits on hero sky (not inside a cream card). Dark skies need cream ink. */
export function useOnSkyColors(): { text: string; muted: string; link: string } {
  const pack = useThemePack();
  if (skyLuminance(pack.sky) < 0.45) {
    return {
      text: colors.cream,
      muted: 'rgba(255, 248, 238, 0.78)',
      link: '#A8D8FF',
    };
  }
  return {
    text: colors.roadGray,
    muted: colors.roadGrayLight,
    link: colors.skyBlueDark,
  };
}
