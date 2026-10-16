import { Image, StyleSheet, View } from 'react-native';
import { useThemePack } from '@/hooks/useResolvedTheme';

type HolidayTileGarnishProps = {
  /** Varies rotation slightly per tile. */
  seed?: number;
  /** Wide plates get a longer sticker; squares keep a corner sticker. */
  shape?: 'square' | 'wide';
};

const leafPile = require('../../../assets/branding/tile-garnish/leaf-pile.png');
const snowDrift = require('../../../assets/branding/tile-garnish/snow-drift.png');
const candyPile = require('../../../assets/branding/tile-garnish/candy-pile.png');

function bit(seed: number, shift: number): number {
  return ((seed * 17 + shift * 13) % 7) - 3;
}

/** Doodle leaf/snow/candy pile nested in the bottom-right corner of a game tile. */
export function HolidayTileGarnish({ seed = 0, shape = 'square' }: HolidayTileGarnishProps) {
  const pack = useThemePack();
  if (pack.ambient === 'classic') {
    return null;
  }

  const wide = shape === 'wide';
  const source =
    pack.ambient === 'snow' ? snowDrift : pack.ambient === 'halloween' ? candyPile : leafPile;
  const tilt = bit(seed, 1);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        wide ? styles.wrapWide : styles.wrapSquare,
        {
          bottom: wide ? -4 : -3,
          right: wide ? -2 : -4,
          transform: [{ rotate: `${tilt}deg` }],
        },
      ]}
    >
      <Image
        source={source}
        style={wide ? styles.artWide : styles.artSquare}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    zIndex: 4,
  },
  wrapSquare: {
    width: 38,
    height: 28,
  },
  wrapWide: {
    width: 56,
    height: 32,
  },
  artSquare: {
    width: 38,
    height: 28,
  },
  artWide: {
    width: 56,
    height: 32,
  },
});
