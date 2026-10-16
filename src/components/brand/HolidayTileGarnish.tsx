import { StyleSheet, View } from 'react-native';
import { useThemePack } from '@/hooks/useResolvedTheme';
import { colors } from '@/theme';

type HolidayTileGarnishProps = {
  /** Varies leaf/snow placement slightly per tile. */
  seed?: number;
  /** Wide plates get a top-edge mound; squares keep a corner sticker. */
  shape?: 'square' | 'wide';
};

function bit(seed: number, shift: number): number {
  return ((seed * 17 + shift * 13) % 7) - 3;
}

const SNOW_FILL = colors.cream;
const SNOW_LINE = '#2D3436';

/** Tiny leaf pile or ink-outline snowdrift on the top-right of a game tile. */
export function HolidayTileGarnish({ seed = 0, shape = 'square' }: HolidayTileGarnishProps) {
  const pack = useThemePack();
  if (pack.ambient === 'classic') {
    return null;
  }

  const nudge = bit(seed, 1);
  const wide = shape === 'wide';

  if (pack.ambient === 'snow') {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.wrap,
          wide ? styles.wrapWide : styles.wrapSquare,
          { top: wide ? -5 : -3, right: wide ? 8 : -1 },
        ]}
      >
        <SnowDrift wide={wide} />
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        wide ? styles.wrapWide : styles.wrapSquare,
        { top: wide ? -6 : -3, right: wide ? 10 : -2 },
      ]}
    >
      <View
        style={[
          styles.leaf,
          styles.leafRust,
          {
            transform: [{ rotate: `${wide ? -18 + nudge : -38 + nudge}deg` }],
            left: wide ? 2 : 2,
            top: wide ? 4 : 6,
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.leafGold,
          {
            transform: [{ rotate: `${wide ? 8 + nudge : 18 + nudge}deg` }],
            left: wide ? 14 : 8,
            top: wide ? 1 : 1,
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          styles.leafMaple,
          {
            transform: [{ rotate: `${wide ? 28 + nudge : -8 + nudge}deg` }],
            left: wide ? 26 : 12,
            top: wide ? 5 : 7,
          },
        ]}
      />
    </View>
  );
}

/** One connected doodle mound (outline copies + cream fill), not two separate clouds. */
function SnowDrift({ wide }: { wide: boolean }) {
  return (
    <View style={wide ? styles.driftWide : styles.driftSquare}>
      <View style={[styles.driftBase, styles.outline, wide ? styles.driftBaseWide : null]} />
      <View style={[styles.driftHumpA, styles.outline, wide ? styles.driftHumpAWide : null]} />
      <View style={[styles.driftHumpB, styles.outline, wide ? styles.driftHumpBWide : null]} />
      <View style={[styles.driftHumpC, styles.outline, wide ? styles.driftHumpCWide : null]} />
      <View style={[styles.driftBase, styles.fill, wide ? styles.driftBaseWide : null]} />
      <View style={[styles.driftHumpA, styles.fill, wide ? styles.driftHumpAWide : null]} />
      <View style={[styles.driftHumpB, styles.fill, wide ? styles.driftHumpBWide : null]} />
      <View style={[styles.driftHumpC, styles.fill, wide ? styles.driftHumpCWide : null]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 4,
  },
  wrapSquare: {
    width: 26,
    height: 20,
  },
  wrapWide: {
    width: 44,
    height: 18,
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
  driftSquare: {
    width: 26,
    height: 16,
  },
  driftWide: {
    width: 44,
    height: 16,
  },
  outline: {
    backgroundColor: SNOW_LINE,
  },
  fill: {
    backgroundColor: SNOW_FILL,
    transform: [{ scale: 0.78 }],
  },
  driftBase: {
    position: 'absolute',
    left: 1,
    right: 1,
    bottom: 0,
    height: 9,
    borderRadius: 999,
  },
  driftBaseWide: {
    height: 10,
  },
  driftHumpA: {
    position: 'absolute',
    left: 1,
    bottom: 3,
    width: 12,
    height: 11,
    borderRadius: 999,
  },
  driftHumpAWide: {
    width: 16,
    height: 12,
  },
  driftHumpB: {
    position: 'absolute',
    left: 8,
    bottom: 4,
    width: 14,
    height: 13,
    borderRadius: 999,
  },
  driftHumpBWide: {
    left: 14,
    width: 18,
    height: 14,
  },
  driftHumpC: {
    position: 'absolute',
    right: 1,
    bottom: 3,
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  driftHumpCWide: {
    width: 14,
    height: 11,
  },
});
