import { Image, Pressable, StyleSheet } from 'react-native';
import { homeHeroHotspots, hostHeroHotspots, type HeroHotspot } from '@/data/heroHotspots';

type HeroSignHotspotsProps = {
  variant: 'home' | 'host';
  onPress: (id: string) => void;
  disabled?: boolean;
};

const hotspotsByVariant: Record<HeroSignHotspotsProps['variant'], HeroHotspot[]> = {
  home: homeHeroHotspots,
  host: hostHeroHotspots,
};

export function HeroSignHotspots({ variant, onPress, disabled = false }: HeroSignHotspotsProps) {
  return (
    <>
      {hotspotsByVariant[variant].map((spot) => (
        <Pressable
          key={spot.id}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={spot.label}
          onPress={() => onPress(spot.id)}
          style={({ pressed }) => [
            styles.hit,
            {
              left: `${spot.left * 100}%`,
              top: `${spot.top * 100}%`,
              width: `${spot.width * 100}%`,
              height: `${spot.height * 100}%`,
            },
            pressed && !disabled && styles.pressed,
          ]}
        >
          {spot.overlay ? (
            <Image source={spot.overlay} style={styles.overlay} resizeMode="contain" />
          ) : null}
        </Pressable>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  hit: {
    position: 'absolute',
  },
  overlay: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 6,
  },
});
