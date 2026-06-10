import { Pressable, StyleSheet, Text, View } from 'react-native';
import { borders, fonts, radii, shadows, spacing } from '@/theme';
import { signPostColors, type SignPostColor } from '@/theme/brand';

type SignPostButtonProps = {
  label: string;
  color: SignPostColor;
  icon?: string;
  selected?: boolean;
  onPress: () => void;
};

export function SignPostButton({
  label,
  color,
  icon,
  selected = false,
  onPress,
}: SignPostButtonProps) {
  const palette = signPostColors[color];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        pressed && styles.pressed,
        selected && styles.selected,
      ]}
    >
      <View style={[styles.arrow, { backgroundColor: palette.fill, borderColor: palette.border }]}>
        {icon ? <Text style={styles.icon}>{icon}</Text> : null}
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
      </View>
      <View style={[styles.arrowTip, { borderRightColor: palette.fill }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  selected: {
    transform: [{ scale: 1.03 }],
  },
  arrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: borders.thick,
    borderRadius: radii.sm,
    minWidth: 200,
  },
  arrowTip: {
    width: 0,
    height: 0,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
});
