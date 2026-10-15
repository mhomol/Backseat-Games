import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { ThemeAmbient } from '@/types/theme';

type Flake = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  color: string;
};

function makeFlakes(kind: Exclude<ThemeAmbient, 'classic'>, width: number): Flake[] {
  const count = kind === 'snow' ? 18 : 14;
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: (index * 47 + 13) % Math.max(width, 1),
    size: kind === 'snow' ? 5 + (index % 5) : 7 + (index % 6),
    duration: 7000 + (index % 6) * 900,
    delay: (index % 8) * 400,
    drift: kind === 'snow' ? 18 + (index % 10) : 28 + (index % 14),
    color: kind === 'snow' ? 'rgba(255,255,255,0.85)' : index % 2 === 0 ? '#D35400' : '#C0392B',
  }));
}

function Particle({ flake, height, kind }: { flake: Flake; height: number; kind: 'leaves' | 'snow' }) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      flake.delay,
      withRepeat(
        withTiming(height + 40, { duration: flake.duration, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    translateX.value = withDelay(
      flake.delay,
      withRepeat(
        withTiming(flake.drift, { duration: flake.duration / 2, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
    rotate.value = withDelay(
      flake.delay,
      withRepeat(withTiming(kind === 'leaves' ? 360 : 20, { duration: flake.duration, easing: Easing.linear }), -1, false),
    );
  }, [flake.delay, flake.drift, flake.duration, height, kind, rotate, translateX, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: flake.left,
          width: flake.size,
          height: kind === 'leaves' ? flake.size * 0.65 : flake.size,
          borderRadius: kind === 'snow' ? flake.size / 2 : 2,
          backgroundColor: flake.color,
        },
        style,
      ]}
    />
  );
}

export function HolidayWeatherEffects({ ambient }: { ambient: ThemeAmbient }) {
  const { width, height } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const flakes = useMemo(
    () => (ambient === 'classic' ? [] : makeFlakes(ambient, width)),
    [ambient, width],
  );

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  if (ambient === 'classic' || reduceMotion) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {flakes.map((flake) => (
        <Particle key={flake.id} flake={flake} height={height} kind={ambient} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: -12,
  },
});
