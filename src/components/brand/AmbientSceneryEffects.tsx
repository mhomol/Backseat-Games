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

type SkyFlyer = 'plane' | 'sleigh' | 'balloon';
type SkyBird = 'bird' | 'turkey' | 'dove';
type GroundCritter = 'gopher' | 'fox' | 'reindeer';
type CritterKind = SkyFlyer | SkyBird | GroundCritter;

type AmbientSceneryEffectsProps = {
  skyFlyer?: SkyFlyer;
  skyBird?: SkyBird;
  groundCritter?: GroundCritter;
};

const birdFrames = [
  require('../../../assets/branding/critters/bird-1.png'),
  require('../../../assets/branding/critters/bird-2.png'),
];
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
const doveFrames = [
  require('../../../assets/branding/critters/dove-1.png'),
  require('../../../assets/branding/critters/dove-2.png'),
];
const balloonSprite = require('../../../assets/branding/critters/balloon.png');
const foxUp = require('../../../assets/branding/critters/fox-up.png');
const foxWink = require('../../../assets/branding/critters/fox-wink.png');
const reindeerUp = require('../../../assets/branding/critters/reindeer-up.png');
const reindeerWink = require('../../../assets/branding/critters/reindeer-wink.png');

function randomGapMs(): number {
  return 12000 + Math.floor(Math.random() * 28000);
}

function pickCritter(
  skyFlyer: SkyFlyer,
  skyBird: SkyBird,
  groundCritter: GroundCritter,
): CritterKind {
  const critters: CritterKind[] = [skyFlyer, skyBird, groundCritter];
  return critters[Math.floor(Math.random() * critters.length)]!;
}

function isSkyFlyer(kind: CritterKind): kind is SkyFlyer {
  return kind === 'plane' || kind === 'sleigh' || kind === 'balloon';
}

function isSkyBird(kind: CritterKind): kind is SkyBird {
  return kind === 'bird' || kind === 'turkey' || kind === 'dove';
}

/**
 * Occasional ambient scenery critters. Non-interactive overlay.
 */
export function AmbientSceneryEffects({
  skyFlyer = 'plane',
  skyBird = 'bird',
  groundCritter = 'gopher',
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
      const skyY = height * (0.06 + Math.random() * 0.2);
      translateX.value = width + 160;
      translateY.value = skyY;
      opacity.value = 1;
      if (kind !== 'balloon') {
        flapId = setInterval(() => {
          setPlaneFrame((frame) => (frame === 0 ? 1 : 0));
        }, 90);
      }
      const duration =
        (kind === 'balloon' ? 11000 : 8000) + Math.floor(Math.random() * 3000);
      translateX.value = withTiming(-180, {
        duration,
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(finish)();
        }
      });
      translateY.value = withTiming(skyY + (Math.random() - 0.5) * height * 0.08, {
        duration,
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

    const runPeek = (kind: GroundCritter) => {
      setActive(kind);
      setGopherWinkOn(false);
      translateX.value = width * 0.2 + Math.random() * width * 0.5;
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
      const kind = pickCritter(skyFlyer, skyBird, groundCritter);
      if (isSkyFlyer(kind)) {
        runSkyFlyer(kind);
      } else if (isSkyBird(kind)) {
        runFlapper(kind);
      } else {
        runPeek(kind);
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
  }, [reduceMotion, width, height, skyFlyer, skyBird, groundCritter, translateX, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (reduceMotion || !active) {
    return null;
  }

  const positionStyle =
    active === 'gopher' || active === 'fox' || active === 'reindeer'
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
  } else if (active === 'balloon') {
    critter = (
      <Image source={balloonSprite} style={styles.balloon} resizeMode="contain" />
    );
  } else if (active === 'bird') {
    critter = (
      <Image source={birdFrames[birdFrame]} style={styles.bird} resizeMode="contain" />
    );
  } else if (active === 'turkey') {
    critter = (
      <Image source={turkeyFrames[birdFrame]} style={styles.turkey} resizeMode="contain" />
    );
  } else if (active === 'dove') {
    critter = (
      <Image source={doveFrames[birdFrame]} style={styles.dove} resizeMode="contain" />
    );
  } else if (active === 'fox') {
    critter = (
      <Image
        source={gopherWinkOn ? foxWink : foxUp}
        style={styles.gopher}
        resizeMode="contain"
      />
    );
  } else if (active === 'reindeer') {
    critter = (
      <Image
        source={gopherWinkOn ? reindeerWink : reindeerUp}
        style={styles.gopher}
        resizeMode="contain"
      />
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
  sleighProp: {
    position: 'absolute',
    left: 2,
    top: 24,
    width: 38,
    height: 38,
  },
  balloon: {
    width: 72,
    height: 102,
  },
  bird: {
    width: 56,
    height: 56,
  },
  turkey: {
    width: 72,
    height: 72,
  },
  dove: {
    width: 64,
    height: 64,
  },
  gopher: {
    width: 72,
    height: 72,
  },
});
