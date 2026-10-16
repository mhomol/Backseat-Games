import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
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

type WeatherKind = 'leaves' | 'snow';

function makeFlakes(kind: WeatherKind, width: number): Flake[] {
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

function Particle({ flake, height, kind }: { flake: Flake; height: number; kind: WeatherKind }) {
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

const GHOST_COUNT = 7;

function MiniGhost({ size }: { size: number }) {
  const eye = Math.max(2, Math.round(size * 0.16));
  return (
    <View style={{ width: size, height: size * 1.2 }}>
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: 'rgba(255, 248, 238, 0.92)',
          borderRadius: size / 2,
          borderBottomLeftRadius: size * 0.18,
          borderBottomRightRadius: size * 0.18,
          borderWidth: 1,
          borderColor: 'rgba(45, 52, 54, 0.35)',
        }}
      >
        <View
          style={{
            position: 'absolute',
            top: size * 0.32,
            left: size * 0.26,
            width: eye,
            height: eye,
            borderRadius: eye / 2,
            backgroundColor: '#2D3436',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: size * 0.32,
            right: size * 0.26,
            width: eye,
            height: eye,
            borderRadius: eye / 2,
            backgroundColor: '#2D3436',
          }}
        />
      </View>
    </View>
  );
}

function FloatingGhost({
  index,
  width,
  height,
}: {
  index: number;
  width: number;
  height: number;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);
  const size = 12 + (index % 4) * 3;

  const play = useCallback(() => {
    const startX = 10 + Math.random() * Math.max(width - 36, 1);
    const startY = height * (0.3 + Math.random() * 0.55);
    const rise = 70 + Math.random() * 100;
    const drift = (Math.random() - 0.5) * 36;
    const duration = 2600 + Math.random() * 2200;
    translateX.value = startX;
    translateY.value = startY;
    opacity.value = 0;
    opacity.value = withSequence(
      withTiming(0.92, { duration: 280 }),
      withDelay(duration - 720, withTiming(0, { duration: 440 })),
    );
    translateX.value = withTiming(startX + drift, {
      duration,
      easing: Easing.inOut(Easing.sin),
    });
    translateY.value = withTiming(startY - rise, {
      duration,
      easing: Easing.out(Easing.quad),
    }, (finished) => {
      if (finished) {
        runOnJS(play)();
      }
    });
  }, [height, opacity, translateX, translateY, width]);

  useEffect(() => {
    const timeoutId = setTimeout(play, 200 + index * 380 + Math.random() * 600);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [index, play]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.ghost, style]}>
      <MiniGhost size={size} />
    </Animated.View>
  );
}

export function HolidayWeatherEffects({ ambient }: { ambient: ThemeAmbient }) {
  const { width, height } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const weather: WeatherKind | null = ambient === 'leaves' || ambient === 'snow' ? ambient : null;
  const flakes = useMemo(
    () => (weather ? makeFlakes(weather, width) : []),
    [weather, width],
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

  if (reduceMotion) {
    return null;
  }

  if (ambient === 'halloween') {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: GHOST_COUNT }, (_, index) => (
          <FloatingGhost key={index} index={index} width={width} height={height} />
        ))}
      </View>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {flakes.map((flake) => (
        <Particle key={flake.id} flake={flake} height={height} kind={weather} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: -16,
  },
  ghost: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
