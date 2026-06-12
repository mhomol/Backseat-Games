import { createElement } from 'react';
import { StackBackButton } from '@/components/navigation/StackBackButton';
import { colors, fonts } from '@/theme';

/** Shared stack header chrome — hero sky on every titled screen. */
export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.heroSky },
  headerTintColor: colors.roadGray,
  headerTitleStyle: { fontFamily: fonts.display, fontSize: 17 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.heroSky },
  headerBackVisible: false,
  headerLeft: (props: { canGoBack?: boolean }) =>
    props.canGoBack ? createElement(StackBackButton) : null,
} as const;
