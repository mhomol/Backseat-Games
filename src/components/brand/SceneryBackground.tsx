import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { sceneryImages, type SceneryVariant } from '@/data/brandAssets';
import { brand } from '@/theme/brand';

/** Hero art is generated at 768×1344 (9:16). */
export const HERO_ASPECT_RATIO = 768 / 1344;

type SceneryBackgroundProps = {
  variant: SceneryVariant;
  children?: ReactNode;
  /** `fit` shows the full illustration; `backdrop` fills the screen for overlay content. */
  layout?: 'fit' | 'backdrop';
};

export function SceneryBackground({
  variant,
  children,
  layout = 'fit',
}: SceneryBackgroundProps) {
  if (layout === 'backdrop') {
    return (
      <View style={styles.backdropRoot}>
        <Image source={sceneryImages[variant]} style={styles.backdropImage} resizeMode="cover" />
        <View style={styles.backdropOverlay} pointerEvents="box-none">
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.frame}>
        <Image source={sceneryImages[variant]} style={styles.image} resizeMode="cover" />
        <View style={styles.overlay} pointerEvents="box-none">
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.cream,
    justifyContent: 'center',
  },
  frame: {
    width: '100%',
    aspectRatio: HERO_ASPECT_RATIO,
    maxHeight: '100%',
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  backdropRoot: {
    flex: 1,
    backgroundColor: brand.cream,
  },
  backdropImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFill,
  },
});
