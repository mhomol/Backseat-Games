import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { useThemePack } from '@/hooks/useResolvedTheme';

const LIGHT_COLORS = ['#E74C3C', '#F1C40F', '#27AE60', '#E67E22', '#3498DB'] as const;

/**
 * Sits on the baked-in home wordmark. Percentages match the hero art frame.
 */
export function HeroLogoSeasonalDoodles() {
  const pack = useThemePack();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);

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
    if (reduceMotion || pack.id !== 'christmas') {
      return;
    }
    const id = setInterval(() => {
      setBlinkOn((value) => !value);
    }, 520);
    return () => clearInterval(id);
  }, [reduceMotion, pack.id]);

  if (pack.id === 'classic') {
    return null;
  }

  if (pack.id === 'thanksgiving') {
    return (
      <View pointerEvents="none" style={styles.root}>
        <CornucopiaDoodle />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={styles.lightRow}>
        {LIGHT_COLORS.concat(LIGHT_COLORS).map((color, index) => {
          const groupA = index % 2 === 0;
          const lit = reduceMotion || (groupA ? blinkOn : !blinkOn);
          return (
            <View
              key={`light-${index}`}
              style={[
                styles.bulb,
                { backgroundColor: color, opacity: lit ? 1 : 0.28 },
              ]}
            />
          );
        })}
      </View>
      <ChristmasTreeDoodle />
    </View>
  );
}

function ChristmasTreeDoodle() {
  return (
    <View style={styles.treeAnchor}>
      <View style={styles.treeStar} />
      <View style={[styles.treeLayer, styles.treeTop]} />
      <View style={[styles.treeLayer, styles.treeMid]} />
      <View style={[styles.treeLayer, styles.treeBot]} />
      <View style={styles.treeTrunk} />
    </View>
  );
}

function CornucopiaDoodle() {
  return (
    <View style={styles.hornAnchor}>
      <View style={styles.hornBody} />
      <View style={styles.hornLip} />
      <View style={[styles.hornFruit, styles.fruitPumpkin]} />
      <View style={[styles.hornFruit, styles.fruitApple]} />
      <View style={[styles.hornFruit, styles.fruitGrape]} />
      <View style={styles.hornLeaf} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 6,
  },
  lightRow: {
    position: 'absolute',
    top: '7.4%',
    left: '16%',
    width: '68%',
    height: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulb: {
    width: 8,
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2D3436',
  },
  treeAnchor: {
    position: 'absolute',
    left: '28.5%',
    top: '19.5%',
    width: 36,
    height: 48,
    alignItems: 'center',
  },
  treeLayer: {
    position: 'absolute',
    backgroundColor: '#1E8449',
    borderWidth: 1.5,
    borderColor: '#2D3436',
  },
  treeTop: {
    top: 6,
    width: 16,
    height: 16,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  treeMid: {
    top: 16,
    width: 24,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#27AE60',
  },
  treeBot: {
    top: 26,
    width: 30,
    height: 16,
    borderRadius: 8,
  },
  treeTrunk: {
    position: 'absolute',
    bottom: 2,
    width: 7,
    height: 8,
    backgroundColor: '#8B5E3C',
    borderWidth: 1,
    borderColor: '#2D3436',
  },
  treeStar: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 8,
    backgroundColor: '#F1C40F',
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
    borderColor: '#2D3436',
  },
  hornAnchor: {
    position: 'absolute',
    left: '70%',
    top: '22%',
    width: 52,
    height: 36,
  },
  hornBody: {
    position: 'absolute',
    left: 8,
    top: 10,
    width: 34,
    height: 16,
    borderRadius: 12,
    backgroundColor: '#C47A3A',
    borderWidth: 1.5,
    borderColor: '#2D3436',
    transform: [{ rotate: '-18deg' }],
  },
  hornLip: {
    position: 'absolute',
    left: 2,
    top: 6,
    width: 16,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#A15C28',
    borderWidth: 1.5,
    borderColor: '#2D3436',
  },
  hornFruit: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#2D3436',
    borderRadius: 999,
  },
  fruitPumpkin: {
    left: 0,
    top: 4,
    width: 12,
    height: 11,
    backgroundColor: '#E67E22',
  },
  fruitApple: {
    left: 8,
    top: 0,
    width: 10,
    height: 10,
    backgroundColor: '#C0392B',
  },
  fruitGrape: {
    left: 16,
    top: 3,
    width: 8,
    height: 8,
    backgroundColor: '#8E44AD',
  },
  hornLeaf: {
    position: 'absolute',
    left: 22,
    top: 0,
    width: 10,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#27AE60',
    borderWidth: 1,
    borderColor: '#2D3436',
    transform: [{ rotate: '28deg' }],
  },
});
