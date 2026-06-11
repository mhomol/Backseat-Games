import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { heroAspectRatio, sceneryImages, type SceneryVariant } from '@/data/brandAssets';
import { brand } from '@/theme/brand';

type SceneryBackgroundProps = {
  variant: SceneryVariant;
  children?: ReactNode;
};

/**
 * Hero scales uniformly to full screen width (no side letterboxing), anchored
 * to the bottom. Shorter screens show sky above; taller art crops from the top.
 */
export function SceneryBackground({ variant, children }: SceneryBackgroundProps) {
  const ratio = heroAspectRatio(variant);

  return (
    <View style={styles.root}>
      <View style={styles.anchor}>
        <View style={[styles.artFrame, { aspectRatio: ratio }]}>
          <Image
            source={sceneryImages[variant]}
            style={styles.artImage}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
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
