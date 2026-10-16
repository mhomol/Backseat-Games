import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useThemePack } from '@/hooks/useResolvedTheme';

const LIGHT_COLORS = ['#E74C3C', '#F1C40F', '#27AE60', '#E67E22', '#3498DB'] as const;
const BULB_COUNT = 17;
const SCALLOPS = 4;
const STRING_LEFT = 0.14;
const STRING_WIDTH = 0.72;
const DROOP_PX = 14;
const WIRE = '#1A4D2E';

type Point = { x: number; y: number };

function strandPoints(width: number): Point[] {
  return Array.from({ length: BULB_COUNT }, (_, index) => {
    const t = index / (BULB_COUNT - 1);
    const local = (t * SCALLOPS) % 1;
    return {
      x: t * width,
      y: 3 + DROOP_PX * 4 * local * (1 - local),
    };
  });
}

/**
 * Christmas lights sit on the baked-in home wordmark. Percentages match the hero art frame.
 * Halloween logo details are painted into the hero in Flux, not overlaid here.
 */
export function HeroLogoSeasonalDoodles() {
  const pack = useThemePack();
  const { width: screenWidth } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [blinkOn, setBlinkOn] = useState(true);
  const stringWidth = screenWidth * STRING_WIDTH;
  const points = useMemo(() => strandPoints(stringWidth), [stringWidth]);

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

  if (pack.id !== 'christmas') {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.root}>
      <View style={[styles.strand, { width: stringWidth, height: DROOP_PX + 22 }]}>
        {points.slice(0, -1).map((start, index) => {
          const end = points[index + 1]!;
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const length = Math.hypot(dx, dy);
          const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`wire-${index}`}
              style={[
                styles.wire,
                {
                  width: length,
                  left: (start.x + end.x) / 2 - length / 2,
                  top: (start.y + end.y) / 2 - 1.25,
                  transform: [{ rotate: `${deg}deg` }],
                },
              ]}
            />
          );
        })}
        {points.map((point, index) => {
          const groupA = index % 2 === 0;
          const lit = reduceMotion || (groupA ? blinkOn : !blinkOn);
          const color = LIGHT_COLORS[index % LIGHT_COLORS.length]!;
          return (
            <View
              key={`bulb-${index}`}
              style={[styles.socketWrap, { left: point.x - 5, top: point.y - 1 }]}
            >
              <View style={styles.socket} />
              <View
                style={[
                  styles.bulb,
                  { backgroundColor: color, opacity: lit ? 1 : 0.32 },
                ]}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 6,
  },
  strand: {
    position: 'absolute',
    top: '12.2%',
    left: `${STRING_LEFT * 100}%`,
  },
  wire: {
    position: 'absolute',
    height: 2.5,
    backgroundColor: WIRE,
    borderRadius: 2,
  },
  socketWrap: {
    position: 'absolute',
    width: 10,
    alignItems: 'center',
  },
  socket: {
    width: 4,
    height: 4,
    backgroundColor: WIRE,
    borderRadius: 1,
  },
  bulb: {
    width: 9,
    height: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#2D3436',
    marginTop: -1,
  },
});
