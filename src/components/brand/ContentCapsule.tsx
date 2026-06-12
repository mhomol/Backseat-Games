import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { borders, colors, radii, spacing } from '@/theme';

type ContentCapsuleProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Semi-opaque panel so copy stays readable over hero scenery. */
export function ContentCapsule({ children, style }: ContentCapsuleProps) {
  return <View style={[styles.capsule, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  capsule: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
  },
});
