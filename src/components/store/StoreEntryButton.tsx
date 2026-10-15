import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borders, colors, fonts, radii, spacing } from '@/theme';

type StoreEntryButtonProps = {
  onPress: () => void;
  badge?: boolean;
};

export function StoreEntryButton({ onPress, badge = false }: StoreEntryButtonProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + spacing.sm, right: insets.right + spacing.sm }]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Store"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.label}>Store</Text>
        {badge ? <View style={styles.badge} accessibilityLabel="New holiday themes" /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 20,
  },
  button: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.cream,
    borderWidth: borders.thick,
    borderColor: colors.sunnyYellowDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.roadGray,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.coral,
  },
});
