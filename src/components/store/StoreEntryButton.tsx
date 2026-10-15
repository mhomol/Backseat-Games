import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

type StoreEntryButtonProps = {
  onPress: () => void;
  badge?: boolean;
};

const CLOUD_FILL = colors.cloudWhite;
const CLOUD_LINE = '#9BB3C2';

/**
 * Sky cloud on the home hero (right-hand cloud bank), not a status-bar chip.
 * Percentages are of the scenery art frame so it stays with the illustration.
 */
export function StoreEntryButton({ onPress, badge = false }: StoreEntryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Store"
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}
    >
      <View pointerEvents="none" style={[styles.puffTop, styles.outline]} />
      <View pointerEvents="none" style={[styles.puffLeft, styles.outline]} />
      <View pointerEvents="none" style={[styles.puffRight, styles.outline]} />
      <View pointerEvents="none" style={[styles.puffBody, styles.outline]} />
      <View pointerEvents="none" style={[styles.puffTop, styles.fill]} />
      <View pointerEvents="none" style={[styles.puffLeft, styles.fill]} />
      <View pointerEvents="none" style={[styles.puffRight, styles.fill]} />
      <View pointerEvents="none" style={[styles.puffBody, styles.fill]} />
      <Text style={styles.label}>Store</Text>
      {badge ? <View style={styles.badge} accessibilityLabel="New holiday themes" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    position: 'absolute',
    left: '70%',
    top: '8.5%',
    width: '26%',
    height: '7.5%',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  outline: {
    backgroundColor: CLOUD_LINE,
  },
  fill: {
    backgroundColor: CLOUD_FILL,
    transform: [{ scale: 0.9 }],
  },
  puffBody: {
    position: 'absolute',
    left: '6%',
    right: '6%',
    bottom: '10%',
    height: '64%',
    borderRadius: 999,
  },
  puffLeft: {
    position: 'absolute',
    left: '0%',
    bottom: '18%',
    width: '42%',
    height: '72%',
    borderRadius: 999,
  },
  puffRight: {
    position: 'absolute',
    right: '2%',
    bottom: '16%',
    width: '40%',
    height: '70%',
    borderRadius: 999,
  },
  puffTop: {
    position: 'absolute',
    left: '26%',
    top: '0%',
    width: '46%',
    height: '64%',
    borderRadius: 999,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 13,
    color: colors.coral,
    zIndex: 2,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.coral,
    borderWidth: 1.5,
    borderColor: colors.cloudWhite,
    zIndex: 3,
  },
});
