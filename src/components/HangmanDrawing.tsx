import { StyleSheet, View, type ViewStyle } from 'react-native';
import { brand } from '@/theme';

const WOOD = brand.wood;
const WOOD_DARK = '#5C3A22';
const WOOD_LIGHT = '#C4895A';
const CREAM = brand.cream;
const STRAP = brand.roadYellow;
const SHIRT = brand.pink;
type SketchProps = {
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  radius?: number;
  rotate?: string;
  circle?: boolean;
  halo?: number;
};

function Sketch({
  left,
  top,
  width,
  height,
  fill = WOOD,
  radius = 3,
  rotate,
  circle = false,
  halo = 0,
}: SketchProps) {
  const wrap: ViewStyle = {
    position: 'absolute',
    left: left - halo,
    top: top - halo,
    width: width + halo * 2,
    height: height + halo * 2,
    backgroundColor: halo > 0 ? CREAM : 'transparent',
    borderRadius: circle ? (width + halo * 2) / 2 : radius + (halo > 0 ? 2 : 0),
    alignItems: 'center',
    justifyContent: 'center',
    transform: rotate ? [{ rotate }] : undefined,
  };
  return (
    <View style={wrap}>
      <View
        style={{
          width,
          height,
          backgroundColor: fill,
          borderRadius: circle ? width / 2 : radius,
          borderWidth: 2,
          borderColor: WOOD_DARK,
        }}
      />
    </View>
  );
}

export function HangmanDrawing({
  missCount,
  maxMisses,
}: {
  missCount: number;
  maxMisses: number;
}) {
  const stage = Math.min(missCount, maxMisses);
  return (
    <View
      style={styles.frame}
      accessibilityLabel={`Roadside traveler drawing, ${stage} of ${maxMisses} misses`}
    >
      <Sketch left={10} top={168} width={88} height={10} radius={4} />
      <Sketch left={20} top={18} width={12} height={152} radius={4} />
      <Sketch left={24} top={28} width={4} height={132} fill={WOOD_LIGHT} radius={2} />
      <Sketch left={20} top={18} width={74} height={12} radius={4} />
      <Sketch left={82} top={30} width={5} height={24} fill={STRAP} radius={2} />
      {stage >= 1 ? (
        <>
          <Sketch left={70} top={50} width={30} height={30} fill={CREAM} circle halo={1} />
          <View style={styles.eyeLeft} />
          <View style={styles.eyeRight} />
        </>
      ) : null}
      {stage >= 2 ? (
        <Sketch left={80} top={80} width={10} height={40} fill={SHIRT} radius={5} halo={1} />
      ) : null}
      {stage >= 3 ? (
        <Sketch left={54} top={88} width={28} height={7} rotate="-26deg" halo={1} />
      ) : null}
      {stage >= 4 ? (
        <>
          <Sketch left={88} top={88} width={28} height={7} rotate="26deg" halo={1} />
          <Sketch left={110} top={80} width={8} height={8} fill={SHIRT} radius={2} halo={1} />
        </>
      ) : null}
      {stage >= 5 ? (
        <Sketch left={56} top={116} width={30} height={7} rotate="-30deg" halo={1} />
      ) : null}
      {stage >= 6 ? (
        <Sketch left={84} top={116} width={30} height={7} rotate="30deg" halo={1} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 128,
    height: 188,
    alignSelf: 'center',
  },
  eyeLeft: {
    position: 'absolute',
    top: 60,
    left: 78,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: WOOD_DARK,
  },
  eyeRight: {
    position: 'absolute',
    top: 60,
    left: 88,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: WOOD_DARK,
  },
});
