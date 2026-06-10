import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { sceneryImages, type SceneryVariant } from '@/data/brandAssets';

type SceneryBackgroundProps = {
  variant: SceneryVariant;
  children: ReactNode;
};

export function SceneryBackground({ variant, children }: SceneryBackgroundProps) {
  return (
    <ImageBackground
      source={sceneryImages[variant]}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlayTop} />
      <View style={styles.overlayBottom} />
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlayTop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  overlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
    backgroundColor: 'rgba(255, 248, 238, 0.55)',
  },
  content: {
    flex: 1,
  },
});
