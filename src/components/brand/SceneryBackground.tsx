import { useLayoutEffect, type ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { useNavigation } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AmbientSceneryEffects } from '@/components/brand/AmbientSceneryEffects';
import { HeroLogoSeasonalDoodles } from '@/components/brand/HeroLogoSeasonalDoodles';
import { HolidayWeatherEffects } from '@/components/brand/HolidayWeatherEffects';
import { GAME_SCENERY_ASPECT } from '@/data/gameSceneryRotation';
import { heroAspectRatio, type SceneryVariant } from '@/data/brandAssets';
import { skyForDisplayedArt } from '@/data/themes';
import { useThemePack } from '@/hooks/useResolvedTheme';
import { stackChromeForSky, statusBarStyleForSky } from '@/theme/navigation';
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
  const navigation = useNavigation();
  const ratio =
    scenerySource || pack.id !== 'classic' ? GAME_SCENERY_ASPECT : heroAspectRatio(variant);
  const source = scenerySource ?? pack.heroes[variant].source;
  const sky = skyForDisplayedArt(pack, variant, scenerySource);

  useLayoutEffect(() => {
    navigation.setOptions(stackChromeForSky(sky));
  }, [navigation, sky]);

  return (
    <View style={[styles.root, { backgroundColor: sky }]}>
      <StatusBar style={statusBarStyleForSky(sky)} />
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
              skyFlyer={
                pack.id === 'christmas' ? 'sleigh' : pack.id === 'thanksgiving' ? 'balloon' : 'plane'
              }
              skyBird={
                pack.id === 'thanksgiving' ? 'turkey' : pack.id === 'christmas' ? 'dove' : 'bird'
              }
              groundCritter={
                pack.id === 'thanksgiving' ? 'fox' : pack.id === 'christmas' ? 'reindeer' : 'gopher'
              }
            />
          ) : null}
          {ambientEffects ? <HolidayWeatherEffects ambient={pack.ambient} /> : null}
          {variant === 'home' ? <HeroLogoSeasonalDoodles /> : null}
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

