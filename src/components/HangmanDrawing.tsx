import { Image, StyleSheet, View, type ImageStyle, type ViewStyle } from 'react-native';
import {
  HANGMAN_FRAME,
  HANGMAN_HEAD,
  hangmanFigureLayout,
  placeFromHead,
  type HangmanBodyPart,
} from '@/data/hangmanFigureLayout';
import { brand } from '@/theme';
import type { HangmanCharacter } from '@/types/theme';

const WOOD = brand.wood;
const WOOD_DARK = '#5C3A22';
const WOOD_LIGHT = '#C4895A';
const CREAM = brand.cream;
const STRAP = brand.roadYellow;
const SHIRT = brand.pink;
const PILGRIM = '#4A3728';
const PILGRIM_BUCKLE = '#F0C060';
const SANTA_RED = '#C0392B';
const SANTA_WHITE = '#FFF8EE';
const SANTA_BEARD = '#F5F5F5';

const standBase = require('../../assets/branding/hangman/stand-base.png');
const standPost = require('../../assets/branding/hangman/stand-post.png');
const standBeam = require('../../assets/branding/hangman/stand-beam.png');
const hitchhikerHead = require('../../assets/branding/hangman/hitchhiker-head.png');
const hitchhikerTorso = require('../../assets/branding/hangman/hitchhiker-torso.png');
const hitchhikerArm = require('../../assets/branding/hangman/hitchhiker-arm.png');
const hitchhikerLeg = require('../../assets/branding/hangman/hitchhiker-leg.png');
const skeletonHead = require('../../assets/branding/hangman/skeleton-head.png');
const skeletonTorso = require('../../assets/branding/hangman/skeleton-torso.png');
const skeletonArm = require('../../assets/branding/hangman/skeleton-arm.png');
const skeletonLeg = require('../../assets/branding/hangman/skeleton-leg.png');
const pilgrimHead = require('../../assets/branding/hangman/pilgrim-head.png');
const pilgrimTorso = require('../../assets/branding/hangman/pilgrim-torso.png');
const pilgrimArm = require('../../assets/branding/hangman/pilgrim-arm.png');
const pilgrimLeg = require('../../assets/branding/hangman/pilgrim-leg.png');
const snowmanHead = require('../../assets/branding/hangman/snowman-head.png');
const snowmanTorso = require('../../assets/branding/hangman/snowman-torso.png');
const snowmanArm = require('../../assets/branding/hangman/snowman-arm.png');
const snowmanLeg = require('../../assets/branding/hangman/snowman-leg.png');

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

function whoLabel(character: HangmanCharacter) {
  if (character === 'santa') return 'Santa';
  if (character === 'pilgrim') return 'Pilgrim';
  if (character === 'ghost') return 'Ghost';
  if (character === 'skeleton') return 'Skeleton';
  if (character === 'snowman') return 'Snowman';
  return 'Roadside traveler';
}

type DoodleParts = {
  head: number;
  torso: number;
  arm: number;
  leg: number;
};

function partBox(part: HangmanBodyPart): ViewStyle {
  const { left, top } = placeFromHead(part);
  const rotate = part.flipOnImage ? part.rotate : undefined;
  const flipHere = part.flipX && !part.flipOnImage;
  const transform = [
    ...(flipHere ? ([{ scaleX: -1 }] as const) : []),
    ...(part.flipY ? ([{ scaleY: -1 }] as const) : []),
    ...(rotate ? ([{ rotate }] as const) : []),
  ];
  return {
    position: 'absolute',
    left,
    top,
    width: part.width,
    height: part.height,
    zIndex: part.zIndex,
    transform: transform.length ? [...transform] : undefined,
    transformOrigin: part.origin,
  };
}

function partImage(part: HangmanBodyPart): ImageStyle {
  return {
    width: part.width,
    height: part.height,
    transform: part.flipOnImage && part.flipX ? [{ scaleX: -1 }] : undefined,
  };
}

function DoodleFigure({
  stage,
  maxMisses,
  character,
  parts,
}: {
  stage: number;
  maxMisses: number;
  character: HangmanCharacter;
  parts: DoodleParts;
}) {
  const layout = hangmanFigureLayout(character);
  if (!layout) return null;
  const layers = [
    {
      key: 'torso',
      z: layout.torso.zIndex,
      show: stage >= 2,
      node: <Image source={parts.torso} style={partBox(layout.torso)} resizeMode="contain" />,
    },
    {
      key: 'armLeft',
      z: layout.armLeft.zIndex,
      show: stage >= 3,
      node: <Image source={parts.arm} style={partBox(layout.armLeft)} resizeMode="contain" />,
    },
    {
      key: 'armRight',
      z: layout.armRight.zIndex,
      show: stage >= 4,
      node: <Image source={parts.arm} style={partBox(layout.armRight)} resizeMode="contain" />,
    },
    {
      key: 'legLeft',
      z: layout.legLeft.zIndex,
      show: stage >= 5,
      node: (
        <View style={partBox(layout.legLeft)}>
          <Image source={parts.leg} style={partImage(layout.legLeft)} resizeMode="contain" />
        </View>
      ),
    },
    {
      key: 'legRight',
      z: layout.legRight.zIndex,
      show: stage >= 6,
      node: (
        <View style={partBox(layout.legRight)}>
          <Image source={parts.leg} style={partImage(layout.legRight)} resizeMode="contain" />
        </View>
      ),
    },
  ]
    .filter((layer) => layer.show)
    .sort((a, b) => a.z - b.z);
  return (
    <View
      style={styles.doodleFrame}
      accessibilityLabel={`${whoLabel(character)} drawing, ${stage} of ${maxMisses} misses`}
    >
      <Image source={standBase} style={styles.standBase} resizeMode="contain" />
      <Image source={standPost} style={styles.stand} resizeMode="contain" />
      <Image source={standBeam} style={styles.stand} resizeMode="contain" />
      {layers.map((layer) => (
        <View key={layer.key}>{layer.node}</View>
      ))}
      {stage >= 1 ? (
        <View
          style={
            layout.head
              ? [partBox({ ...layout.head, zIndex: layout.head.zIndex ?? 5 }), { overflow: 'hidden' }]
              : [styles.headLock, { width: HANGMAN_HEAD.width, height: HANGMAN_HEAD.height }]
          }
        >
          <Image
            source={parts.head}
            style={
              layout.head
                ? partImage(layout.head)
                : { width: HANGMAN_HEAD.width, height: HANGMAN_HEAD.height }
            }
            resizeMode="contain"
          />
        </View>
      ) : null}
    </View>
  );
}

export function HangmanDrawing({
  missCount,
  maxMisses,
  character = 'hitchhiker',
}: {
  missCount: number;
  maxMisses: number;
  character?: HangmanCharacter;
}) {
  const stage = Math.min(missCount, maxMisses);
  if (character === 'hitchhiker') {
    return (
      <DoodleFigure
        stage={stage}
        maxMisses={maxMisses}
        character={character}
        parts={{
          head: hitchhikerHead,
          torso: hitchhikerTorso,
          arm: hitchhikerArm,
          leg: hitchhikerLeg,
        }}
      />
    );
  }
  if (character === 'skeleton') {
    return (
      <DoodleFigure
        stage={stage}
        maxMisses={maxMisses}
        character={character}
        parts={{
          head: skeletonHead,
          torso: skeletonTorso,
          arm: skeletonArm,
          leg: skeletonLeg,
        }}
      />
    );
  }
  if (character === 'pilgrim') {
    return (
      <DoodleFigure
        stage={stage}
        maxMisses={maxMisses}
        character={character}
        parts={{
          head: pilgrimHead,
          torso: pilgrimTorso,
          arm: pilgrimArm,
          leg: pilgrimLeg,
        }}
      />
    );
  }
  if (character === 'snowman') {
    return (
      <DoodleFigure
        stage={stage}
        maxMisses={maxMisses}
        character={character}
        parts={{
          head: snowmanHead,
          torso: snowmanTorso,
          arm: snowmanArm,
          leg: snowmanLeg,
        }}
      />
    );
  }

  const coat =
    character === 'santa' ? SANTA_RED : character === 'pilgrim' ? PILGRIM : CREAM;
  const who = whoLabel(character);
  return (
    <View
      style={styles.sketchFrame}
      accessibilityLabel={`${who} drawing, ${stage} of ${maxMisses} misses`}
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
          {character === 'pilgrim' ? (
            <>
              <Sketch left={66} top={42} width={38} height={10} fill={PILGRIM} radius={2} />
              <Sketch left={74} top={34} width={22} height={12} fill={PILGRIM} radius={2} />
              <Sketch left={82} top={36} width={6} height={6} fill={PILGRIM_BUCKLE} radius={1} />
            </>
          ) : null}
          {character === 'santa' ? (
            <>
              <Sketch left={68} top={36} width={34} height={16} fill={SANTA_RED} radius={6} />
              <Sketch left={92} top={30} width={10} height={10} fill={SANTA_WHITE} circle />
              <Sketch left={72} top={70} width={26} height={12} fill={SANTA_BEARD} radius={6} />
            </>
          ) : null}
        </>
      ) : null}
      {stage >= 2 ? (
        <>
          <Sketch left={80} top={80} width={10} height={40} fill={coat} radius={5} halo={1} />
          {character === 'pilgrim' ? (
            <Sketch left={76} top={78} width={18} height={6} fill={CREAM} radius={2} />
          ) : null}
        </>
      ) : null}
      {stage >= 3 ? (
        <Sketch left={54} top={88} width={28} height={7} rotate="-26deg" halo={1} />
      ) : null}
      {stage >= 4 ? (
        <>
          <Sketch left={88} top={88} width={28} height={7} rotate="26deg" halo={1} />
          <Sketch left={110} top={80} width={8} height={8} fill={coat} radius={2} halo={1} />
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
  doodleFrame: {
    width: HANGMAN_FRAME.width,
    height: HANGMAN_FRAME.height,
    alignSelf: 'center',
    overflow: 'visible',
  },
  sketchFrame: {
    width: 128,
    height: 188,
    alignSelf: 'center',
  },
  stand: {
    position: 'absolute',
    left: 0,
    top: -10,
    width: HANGMAN_FRAME.width,
    height: HANGMAN_FRAME.height,
    zIndex: 1,
  },
  standBase: {
    position: 'absolute',
    left: 0,
    top: -5,
    width: HANGMAN_FRAME.width,
    height: HANGMAN_FRAME.height,
    zIndex: 0,
  },
  headLock: {
    position: 'absolute',
    left: HANGMAN_HEAD.left,
    top: HANGMAN_HEAD.top,
    zIndex: 5,
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
