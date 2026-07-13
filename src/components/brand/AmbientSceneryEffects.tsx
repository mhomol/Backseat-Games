import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type CritterKind = 'plane' | 'bird' | 'gopher';

const CRITTERS: CritterKind[] = ['plane', 'bird', 'gopher'];

const birdFrames = [
  require('../../../assets/branding/critters/bird-1.png'),
  require('../../../assets/branding/critters/bird-2.png'),
];
const planeFrames = [
  require('../../../assets/branding/critters/plane.png'),
  require('../../../assets/branding/critters/plane-2.png'),
];
const gopherUp = require('../../../assets/branding/critters/gopher-up.png');
const gopherWink = require('../../../assets/branding/critters/gopher-wink.png');

function randomGapMs(): number {
  return 12000 + Math.floor(Math.random() * 28000);
}

function pickCritter(): CritterKind {
  return CRITTERS[Math.floor(Math.random() * CRITTERS.length)]!;
}

/**
 * Occasional ambient scenery critters. Non-interactive overlay.
 */
export function AmbientSceneryEffects() {
  const { width, height } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [active, setActive] = useState<CritterKind | null>(null);
  const [birdFrame, setBirdFrame] = useState(0);
  const [planeFrame, setPlaneFrame] = useState(0);
  const [gopherWinkOn, setGopherWinkOn] = useState(false);

  const translateX = useSharedValue(-120);
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

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

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let flapId: ReturnType<typeof setInterval> | null = null;

    const clearFlap = () => {
      if (flapId) {
        clearInterval(flapId);
        flapId = null;
      }
    };

    const finish = () => {
      if (cancelled) {
        return;
      }
      clearFlap();
      setActive(null);
      setGopherWinkOn(false);
      scheduleNext();
    };

    const runPlane = () => {
      setActive('plane');
      setPlaneFrame(0);
      // Art faces left — fly right-to-left so the nose leads.
      const skyY = height * (0.06 + Math.random() * 0.2);
      translateX.value = width + 140;
      translateY.value = skyY;
      opacity.value = 1;
      // Fast 2-frame prop swap — enough for a 2-blade spin at this size.
      flapId = setInterval(() => {
        setPlaneFrame((frame) => (frame === 0 ? 1 : 0));
      }, 90);
      translateX.value = withTiming(-140, {
        duration: 8000 + Math.floor(Math.random() * 3000),
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(finish)();
        }
      });
      // Mild altitude drift so the path is not a flat line every time.
      translateY.value = withTiming(skyY + (Math.random() - 0.5) * height * 0.08, {
        duration: 8000,
        easing: Easing.inOut(Easing.sin),
      });
    };

    const runBird = () => {
      setActive('bird');
      setBirdFrame(0);
      const skyY = height * (0.1 + Math.random() * 0.22);
      translateX.value = -100;
      translateY.value = skyY;
      opacity.value = 1;
      flapId = setInterval(() => {
        setBirdFrame((frame) => (frame === 0 ? 1 : 0));
      }, 180);
      translateX.value = withTiming(width + 100, {
        duration: 6000 + Math.floor(Math.random() * 2500),
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(finish)();
        }
      });
      translateY.value = withTiming(skyY + (Math.random() - 0.5) * height * 0.1, {
        duration: 6500,
        easing: Easing.inOut(Easing.sin),
      });
    };

    const runGopher = () => {
      setActive('gopher');
      setGopherWinkOn(false);
      translateX.value = width * 0.2 + Math.random() * width * 0.5;
      // Peek sits slightly below the screen edge so paws don't float.
      const hiddenY = 98;
      const peekedY = 8;
      translateY.value = hiddenY;
      opacity.value = 1;
      translateY.value = withSequence(
        withTiming(peekedY, { duration: 600, easing: Easing.out(Easing.cubic) }),
        withDelay(1600, withTiming(hiddenY, { duration: 500, easing: Easing.in(Easing.cubic) })),
      );
      setTimeout(() => {
        if (!cancelled) {
          setGopherWinkOn(true);
        }
      }, 900);
      setTimeout(() => {
        if (!cancelled) {
          setGopherWinkOn(false);
        }
      }, 1400);
      setTimeout(() => {
        if (!cancelled) {
          finish();
        }
      }, 2800);
    };

    const playOne = () => {
      if (cancelled) {
        return;
      }
      const kind = pickCritter();
      if (kind === 'plane') {
        runPlane();
      } else if (kind === 'bird') {
        runBird();
      } else {
        runGopher();
      }
    };

    const scheduleNext = () => {
      timeoutId = setTimeout(playOne, randomGapMs());
    };

    timeoutId = setTimeout(playOne, 4000 + Math.floor(Math.random() * 4000));

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      clearFlap();
    };
  }, [reduceMotion, width, height, translateX, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (reduceMotion || !active) {
    return null;
  }

  const source =
    active === 'plane'
      ? planeFrames[planeFrame]
      : active === 'bird'
        ? birdFrames[birdFrame]
        : gopherWinkOn
          ? gopherWink
          : gopherUp;

  const sizeStyle =
    active === 'plane'
      ? styles.plane
      : active === 'bird'
        ? styles.bird
        : styles.gopher;

  const positionStyle =
    active === 'gopher'
      ? styles.gopherAnchor
      : styles.skyAnchor;

  return (
    <View style={styles.root} pointerEvents="none">
      <Animated.View style={[positionStyle, animatedStyle]}>
        <Image source={source} style={sizeStyle} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 2,
  },
  skyAnchor: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gopherAnchor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  plane: {
    width: 88,
    height: 56,
  },
  bird: {
    width: 56,
    height: 56,
  },
  gopher: {
    width: 72,
    height: 72,
  },
});
