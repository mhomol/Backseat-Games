import { StyleSheet, View } from 'react-native';
import { useThemePack } from '@/hooks/useResolvedTheme';
import { colors } from '@/theme';

type HolidayTileGarnishProps = {
  /** Varies leaf/snow placement slightly per tile. */
  seed?: number;
};

function bit(seed: number, shift: number): number {
  return ((seed * 17 + shift * 13) % 7) - 3;
}

/** Tiny leaf or snow pile on the top-right edge of game tiles. */
export function HolidayTileGarnish({ seed = 0 }: HolidayTileGarnishProps) {
  const pack = useThemePack();
  if (pack.ambient === 'classic') {
    return null;
  }

  const nudge = bit(seed, 1);

  if (pack.ambient === 'snow') {
    return (
      <View pointerEvents="none" style={[styles.wrap, { top: -2 + nudge * 0.2, right: -1 }]}>
        <View style={[styles.snowBase, { width: 22, height: 10 }]} />
        <View style={[styles.snowCap, { left: 4, top: -4, width: 14, height: 10 }]} />
        <View style={[styles.snowDot, { left: 16, top: -2 }]} />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: -3, right: -2 }]}>
      <View
        style={[
          styles.leaf,
          styles.leafRust,
          { transform: [{ rotate: `${-38 + nudge}deg` }], left: 2, top: 6 },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.leafGold,
          { transform: [{ rotate: `${18 + nudge}deg` }], left: 8, top: 1 },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.leafMaple,
          { transform: [{ rotate: `${-8 + nudge}deg` }], left: 12, top: 7 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 26,
    height: 20,
    zIndex: 4,
  },
  leaf: {
    position: 'absolute',
    width: 11,
    height: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(45, 52, 54, 0.35)',
  },
  leafRust: {
    backgroundColor: '#C0392B',
  },
  leafGold: {
    backgroundColor: '#E67E22',
  },
  leafMaple: {
    backgroundColor: '#D35400',
  },
  snowBase: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.cloudWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(155, 179, 194, 0.7)',
  },
  snowCap: {
    position: 'absolute',
    backgroundColor: colors.cloudWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(155, 179, 194, 0.55)',
  },
  snowDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.cloudWhite,
    borderWidth: 1,
    borderColor: 'rgba(155, 179, 194, 0.55)',
  },
});
