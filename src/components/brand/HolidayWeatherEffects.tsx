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
  tilt: number;
};

const LEAF_COLORS = ['#C0392B', '#D35400', '#E67E22', '#B9770E', '#A04000'];

function makeFlakes(kind: Exclude<ThemeAmbient, 'classic'>, width: number): Flake[] {
  const count = kind === 'snow' ? 18 : 12;
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: (index * 47 + 13) % Math.max(width, 1),
    size: kind === 'snow' ? 5 + (index % 5) : 11 + (index % 6),
    duration: 7000 + (index % 6) * 900,
    delay: (index % 8) * 400,
    drift: kind === 'snow' ? 18 + (index % 10) : 36 + (index % 18),
    color: kind === 'snow' ? 'rgba(255,255,255,0.85)' : LEAF_COLORS[index % LEAF_COLORS.length]!,
    tilt: (index % 5) * 18 - 36,
  }));
}

function Particle({ flake, height, kind }: { flake: Flake; height: number; kind: 'leaves' | 'snow' }) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(flake.tilt);

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
      withRepeat(
        withTiming(flake.tilt + (kind === 'leaves' ? 280 : 20), {
          duration: flake.duration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
  }, [flake.delay, flake.drift, flake.duration, flake.tilt, height, kind, rotate, translateX, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  if (kind === 'snow') {
    return (
      <Animated.View
        pointerEvents="none"
        style={[
          styles.particle,
          {
            left: flake.left,
            width: flake.size,
            height: flake.size,
            borderRadius: flake.size / 2,
            backgroundColor: flake.color,
          },
          style,
        ]}
      />
    );
  }

  const w = flake.size;
  const h = flake.size * 1.55;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.particle, { left: flake.left, width: w, height: h }, style]}
    >
      <View
        style={{
          width: w,
          height: h,
          backgroundColor: flake.color,
          borderTopLeftRadius: w,
          borderTopRightRadius: w * 0.15,
          borderBottomLeftRadius: w * 0.2,
          borderBottomRightRadius: h * 0.55,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: w * 0.42,
          top: h * 0.12,
          width: 1.5,
          height: h * 0.72,
          backgroundColor: 'rgba(80, 30, 10, 0.28)',
          borderRadius: 1,
        }}
      />
    </Animated.View>
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
    top: -16,
  },
});
