import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii, shadows, spacing } from '@/theme';

type StackBackButtonProps = {
  label?: string;
};

/** Pill back control matching the native iOS stack style on host/join screens. */
export function StackBackButton({ label = 'Back' }: StackBackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.back()}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.pill}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.58)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 36,
    ...shadows.card,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.roadGray,
  },
});
