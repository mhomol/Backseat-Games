import { createElement } from 'react';
import { StackBackButton } from '@/components/navigation/StackBackButton';
import type { ThemePack } from '@/data/themes';
import { fonts } from '@/theme';
import { chromeForegroundForSky } from '@/utils/skyChrome';

export { chromeForegroundForSky, skyLuminance, statusBarStyleForSky } from '@/utils/skyChrome';

type ThemedStackOptions = {
  headerStyle: { backgroundColor: string };
  headerTintColor: string;
  headerTitleStyle: { fontFamily: string; fontSize: number; color: string };
  headerShadowVisible: false;
  contentStyle: { backgroundColor: string };
  headerBackVisible: false;
  headerLeft: (props: { canGoBack?: boolean }) => ReturnType<typeof createElement> | null;
};

/** Header + letterbox chrome for a specific still's sampled sky. */
export function stackChromeForSky(sky: string): {
  headerStyle: { backgroundColor: string };
  headerTintColor: string;
  headerTitleStyle: { fontFamily: string; fontSize: number; color: string };
  contentStyle: { backgroundColor: string };
} {
  const foreground = chromeForegroundForSky(sky);
  return {
    headerStyle: { backgroundColor: sky },
    headerTintColor: foreground,
    headerTitleStyle: { fontFamily: fonts.display, fontSize: 17, color: foreground },
    contentStyle: { backgroundColor: sky },
  };
}

/** Shared stack header chrome — default is the pack fallback sky until the screen's hero applies. */
export function stackScreenOptionsForPack(pack: Pick<ThemePack, 'id' | 'sky'>): ThemedStackOptions {
  return {
    ...stackChromeForSky(pack.sky),
    headerShadowVisible: false,
    headerBackVisible: false,
    headerLeft: (props: { canGoBack?: boolean }) =>
      props.canGoBack ? createElement(StackBackButton) : null,
  };
}

/** Classic-sky fallback for modules that cannot read the active pack. */
export const stackScreenOptions = stackScreenOptionsForPack({
  id: 'classic',
  sky: '#59B9E1',
});
