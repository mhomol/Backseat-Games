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

type SkyFlyer = 'plane' | 'sleigh';
type SkyBird = 'bird' | 'turkey';
type CritterKind = SkyFlyer | SkyBird | 'gopher';

type AmbientSceneryEffectsProps = {
  /** Christmas swaps the plane for a Santa sleigh. */
  skyFlyer?: SkyFlyer;
  /** Thanksgiving swaps the songbird for a turkey. */
  skyBird?: SkyBird;
};

const birdFrames = [
  require('../../../assets/branding/critters/bird-1.png'),
  require('../../../assets/branding/critters/bird-2.png'),
];
/** Static body (no blades); props alternate on the nose. */
const planeBody = require('../../../assets/branding/critters/plane.png');
const planePropFrames = [
  require('../../../assets/branding/critters/plane-prop-1.png'),
  require('../../../assets/branding/critters/plane-prop-2.png'),
];
const gopherUp = require('../../../assets/branding/critters/gopher-up.png');
const gopherWink = require('../../../assets/branding/critters/gopher-wink.png');
const sleighSprite = require('../../../assets/branding/critters/sleigh.png');
const turkeyFrames = [
  require('../../../assets/branding/critters/turkey-1.png'),
  require('../../../assets/branding/critters/turkey-2.png'),
];

function randomGapMs(): number {
  return 12000 + Math.floor(Math.random() * 28000);
}

function pickCritter(skyFlyer: SkyFlyer, skyBird: SkyBird): CritterKind {
  const critters: CritterKind[] = [skyFlyer, skyBird, 'gopher'];
  return critters[Math.floor(Math.random() * critters.length)]!;
}

/**
 * Occasional ambient scenery critters. Non-interactive overlay.
 */
export function AmbientSceneryEffects({
  skyFlyer = 'plane',
  skyBird = 'bird',
}: AmbientSceneryEffectsProps) {
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

    const runSkyFlyer = (kind: SkyFlyer) => {
      setActive(kind);
      setPlaneFrame(0);
      // Plane and sleigh both face left — fly right-to-left so the nose leads.
      const skyY = height * (0.06 + Math.random() * 0.2);
      translateX.value = width + 160;
      translateY.value = skyY;
      opacity.value = 1;
      flapId = setInterval(() => {
        setPlaneFrame((frame) => (frame === 0 ? 1 : 0));
      }, 90);
      translateX.value = withTiming(-180, {
        duration: 8000 + Math.floor(Math.random() * 3000),
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(finish)();
        }
      });
      translateY.value = withTiming(skyY + (Math.random() - 0.5) * height * 0.08, {
        duration: 8000,
        easing: Easing.inOut(Easing.sin),
      });
    };

    const runFlapper = (kind: SkyBird) => {
      setActive(kind);
      setBirdFrame(0);
      const skyY = height * (0.1 + Math.random() * 0.22);
      const startX = kind === 'turkey' ? -120 : -100;
      const endX = width + (kind === 'turkey' ? 120 : 100);
      const duration = (kind === 'turkey' ? 7500 : 6000) + Math.floor(Math.random() * 2500);
      translateX.value = startX;
      translateY.value = skyY;
      opacity.value = 1;
      flapId = setInterval(() => {
        setBirdFrame((frame) => (frame === 0 ? 1 : 0));
      }, kind === 'turkey' ? 220 : 180);
      translateX.value = withTiming(endX, {
        duration,
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(finish)();
        }
      });
      translateY.value = withTiming(skyY + (Math.random() - 0.5) * height * 0.1, {
        duration: duration + 500,
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
      const kind = pickCritter(skyFlyer, skyBird);
      if (kind === 'plane' || kind === 'sleigh') {
        runSkyFlyer(kind);
      } else if (kind === 'bird' || kind === 'turkey') {
        runFlapper(kind);
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
  }, [reduceMotion, width, height, skyFlyer, skyBird, translateX, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (reduceMotion || !active) {
    return null;
  }

  const positionStyle =
    active === 'gopher'
      ? styles.gopherAnchor
      : styles.skyAnchor;

  let critter = null;
  if (active === 'plane') {
    critter = (
      <View style={styles.plane}>
        <Image source={planeBody} style={styles.planeBody} resizeMode="contain" />
        <Image
          source={planePropFrames[planeFrame]}
          style={styles.planeProp}
          resizeMode="contain"
        />
      </View>
    );
  } else if (active === 'sleigh') {
    critter = (
      <View style={styles.sleigh}>
        <Image source={sleighSprite} style={styles.sleighBody} resizeMode="contain" />
        <Image
          source={planePropFrames[planeFrame]}
          style={styles.sleighProp}
          resizeMode="contain"
        />
      </View>
    );
  } else if (active === 'bird') {
    critter = (
      <Image source={birdFrames[birdFrame]} style={styles.bird} resizeMode="contain" />
    );
  } else if (active === 'turkey') {
    critter = (
      <Image source={turkeyFrames[birdFrame]} style={styles.turkey} resizeMode="contain" />
    );
  } else {
    critter = (
      <Image
        source={gopherWinkOn ? gopherWink : gopherUp}
        style={styles.gopher}
        resizeMode="contain"
      />
    );
  }

  return (
    <View style={styles.root} pointerEvents="none">
      <Animated.View style={[positionStyle, animatedStyle]}>
        {critter}
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
  planeBody: {
    width: 88,
    height: 56,
  },
  /** Nose hub sits near the left; overlay spins in place over the cowling. */
  planeProp: {
    position: 'absolute',
    left: -4,
    top: 18,
    width: 28,
    height: 28,
  },
  sleigh: {
    width: 128,
    height: 72,
  },
  sleighBody: {
    width: 128,
    height: 72,
  },
  /** Pink nose hub — same 2-frame prop overlay as the plane. */
  sleighProp: {
    position: 'absolute',
    left: 2,
    top: 24,
    width: 38,
    height: 38,
  },
  bird: {
    width: 56,
    height: 56,
  },
  turkey: {
    width: 72,
    height: 72,
  },
  gopher: {
    width: 72,
    height: 72,
  },
});
