import { createElement } from 'react';
import { StackBackButton } from '@/components/navigation/StackBackButton';
import type { ThemePack } from '@/data/themes';
import { colors, fonts } from '@/theme';

type ThemedStackOptions = {
  headerStyle: { backgroundColor: string };
  headerTintColor: string;
  headerTitleStyle: { fontFamily: string; fontSize: number; color: string };
  headerShadowVisible: false;
  contentStyle: { backgroundColor: string };
  headerBackVisible: false;
  headerLeft: (props: { canGoBack?: boolean }) => ReturnType<typeof createElement> | null;
};

function chromeForeground(pack: Pick<ThemePack, 'id'>): string {
  return pack.id === 'christmas' ? colors.cream : colors.roadGray;
}

/** Shared stack header chrome — matches the active theme sky so it blends with hero art. */
export function stackScreenOptionsForPack(pack: Pick<ThemePack, 'id' | 'sky'>): ThemedStackOptions {
  const foreground = chromeForeground(pack);
  return {
    headerStyle: { backgroundColor: pack.sky },
    headerTintColor: foreground,
    headerTitleStyle: { fontFamily: fonts.display, fontSize: 17, color: foreground },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: pack.sky },
    headerBackVisible: false,
    headerLeft: (props: { canGoBack?: boolean }) =>
      props.canGoBack ? createElement(StackBackButton) : null,
  };
}

/** Classic-sky fallback for modules that cannot read the active pack. */
export const stackScreenOptions = stackScreenOptionsForPack({
  id: 'classic',
  sky: colors.heroSky,
});
