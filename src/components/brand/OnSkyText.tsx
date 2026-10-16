import { Text, type TextProps } from 'react-native';
import { useOnSkyColors } from '@/hooks/useResolvedTheme';

type OnSkyTextProps = TextProps & {
  tone?: 'text' | 'muted' | 'link';
};

/** Body copy that sits on theme sky instead of a cream card. */
export function OnSkyText({ tone = 'text', style, ...props }: OnSkyTextProps) {
  const colorsOnSky = useOnSkyColors();
  return <Text {...props} style={[{ color: colorsOnSky[tone] }, style]} />;
}
