import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { AmbientSceneryEffects } from '@/components/brand/AmbientSceneryEffects';
import { HolidayWeatherEffects } from '@/components/brand/HolidayWeatherEffects';
import { GAME_SCENERY_ASPECT } from '@/data/gameSceneryRotation';
import { heroAspectRatio, type SceneryVariant } from '@/data/brandAssets';
import { useThemePack } from '@/hooks/useResolvedTheme';
import { brand } from '@/theme/brand';

type SceneryBackgroundProps = {
  variant: SceneryVariant;
  /** Overrides the static variant art (lobby + gameplay rotation). */
  scenerySource?: ImageSourcePropType;
  children?: ReactNode;
  /** Ambient sky/critter overlays. Default true. */
  ambientEffects?: boolean;
};

/**
 * Hero scales uniformly to full screen width (no side letterboxing), anchored
 * to the bottom. Shorter screens show sky above; taller art crops from the top.
 */
export function SceneryBackground({
  variant,
  scenerySource,
  children,
  ambientEffects = true,
}: SceneryBackgroundProps) {
  const pack = useThemePack();
  const ratio =
    scenerySource || pack.id !== 'classic' ? GAME_SCENERY_ASPECT : heroAspectRatio(variant);
  const source = scenerySource ?? pack.heroes[variant];

  return (
    <View style={[styles.root, { backgroundColor: pack.sky }]}>
      <View style={styles.anchor}>
        <View style={[styles.artFrame, { aspectRatio: ratio }]}>
          <Image
            source={source}
            style={styles.artImage}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          {ambientEffects ? (
            <AmbientSceneryEffects
              skyFlyer={pack.id === 'christmas' ? 'sleigh' : 'plane'}
              skyBird={pack.id === 'thanksgiving' ? 'turkey' : 'bird'}
            />
          ) : null}
          {ambientEffects ? <HolidayWeatherEffects ambient={pack.ambient} /> : null}
          <View style={styles.overlay} pointerEvents="box-none">
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.sky,
  },
  anchor: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  artFrame: {
    width: '100%',
    position: 'relative',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});

