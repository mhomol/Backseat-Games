import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { playClaimFeedback, playTruckHornFeedback } from '@/services/feedback';
import { SceneryScreenFrame } from '@/components/brand/SceneryScreenFrame';
import { GameEndBar } from '@/components/GameEndBar';
import { GameSessionOverlays } from '@/components/GameSessionOverlays';
import { Scoreboard } from '@/components/Scoreboard';
import { plates } from '@/data';
import { plateImageByCode } from '@/data/plateImages';
import { getLicensePlateScores } from '@/games/licensePlates';
import { useGameSessionGuard } from '@/hooks/useGameSessionGuard';
import { useSessionGameScenery } from '@/hooks/useSessionGameScenery';
import { useSessionStore } from '@/store/sessionStore';
import { getSessionWinnerDisplay } from '@/utils/winnerLabel';
import { borders, brand, colors, fonts, radii, spacing } from '@/theme';

export default function LicensePlatesScreen() {
  const guard = useGameSessionGuard();
  const session = useSessionStore((state) => state.session);
  const localPlayerId = useSessionStore((state) => state.localPlayerId);
  const dispatchAction = useSessionStore((state) => state.dispatchAction);
  const scenerySource = useSessionGameScenery();

  const requestEnd = useCallback(() => guard.requestEndGame(), [guard]);

  const gameState = session?.gameState?.type === 'license-plates' ? session.gameState : null;

  const scores = useMemo(() => {
    if (!gameState || !session) {
      return [];
    }
    const totals = getLicensePlateScores(gameState, session.players);
    return session.players.map((player) => ({
      name: player.name,
      score: totals[player.id] ?? 0,
      isYou: player.id === localPlayerId,
    }));
  }, [gameState, session, localPlayerId]);

  const winnerDisplay = useMemo(() => {
    if (!session) {
      return null;
    }
    return getSessionWinnerDisplay(session, localPlayerId);
  }, [session, localPlayerId]);

  if (!gameState || !session) {
    return null;
  }

  return (
    <SceneryScreenFrame scenerySource={scenerySource}>
      <GameSessionOverlays
        guard={guard}
        winnerHeadline={winnerDisplay?.headline}
        isWinnerYou={winnerDisplay?.isYou}
      />
      <Scoreboard scores={scores} />
      <FlashList
        style={styles.list}
        data={plates}
        numColumns={2}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const ownerId = gameState.claims[item.code];
          const isMine = ownerId === localPlayerId;
          const isTaken = ownerId !== null && !isMine;
          const ownerName = session.players.find((p) => p.id === ownerId)?.name;
          const plateImage = plateImageByCode[item.code];

          return (
            <PlateTile
              code={item.code}
              name={item.name}
              plateImage={plateImage}
              isMine={isMine}
              isTaken={isTaken}
              ownerName={ownerName}
              onPress={() => {
                if (isMine) {
                  void playClaimFeedback();
                  dispatchAction({ type: 'UNCLAIM_PLATE', plateCode: item.code });
                } else if (!isTaken) {
                  const myClaims = Object.values(gameState.claims).filter(
                    (id) => id === localPlayerId,
                  ).length;
                  if (myClaims === 0) {
                    void playTruckHornFeedback();
                  } else {
                    void playClaimFeedback();
                  }
                  dispatchAction({ type: 'CLAIM_PLATE', plateCode: item.code });
                }
              }}
            />
          );
        }}
      />
      {guard.isInProgress ? (
        <GameEndBar isHost={guard.isHost} onPress={requestEnd} />
      ) : null}
    </SceneryScreenFrame>
  );
}

function PlateTile({
  code,
  name,
  plateImage,
  isMine,
  isTaken,
  ownerName,
  onPress,
}: {
  code: string;
  name: string;
  plateImage?: ImageSourcePropType;
  isMine: boolean;
  isTaken: boolean;
  ownerName?: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const stamp = useSharedValue(isMine ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const stampStyle = useAnimatedStyle(() => ({
    opacity: stamp.value,
    transform: [{ scale: stamp.value }, { rotate: '-12deg' }],
  }));

  return (
    <Animated.View style={[styles.tileWrap, animatedStyle]}>
      <Pressable
        style={[
          styles.cell,
          isMine && styles.cellMine,
          isTaken && styles.cellTaken,
        ]}
        onPress={() => {
          if (!isMine && !isTaken) {
            stamp.value = withSequence(
              withTiming(1.2, { duration: 120 }),
              withSpring(1),
            );
          }
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
      >
        <View style={styles.innerFrame} pointerEvents="none" />
        {plateImage ? (
          <Image source={plateImage} style={styles.plateImage} resizeMode="cover" />
        ) : (
          <View style={styles.plateFallback} />
        )}
        {isMine ? <View style={styles.overlayMine} /> : null}
        {isTaken ? <View style={styles.overlayTaken} /> : null}
        <View style={styles.labelStack}>
          <Text style={[styles.code, isTaken && styles.textMuted]}>{code}</Text>
          <Text style={[styles.name, isTaken && styles.textMuted]} numberOfLines={2}>
            {name}
          </Text>
          {isTaken ? (
            <Text style={styles.owner} numberOfLines={1}>
              {ownerName}
            </Text>
          ) : null}
        </View>
        {isMine ? (
          <Animated.View style={[styles.claimedBadge, stampStyle]}>
            <Text style={styles.claimedBadgeText}>SPOTTED</Text>
          </Animated.View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  tileWrap: {
    flex: 1,
  },
  cell: {
    flex: 1,
    margin: spacing.xs,
    aspectRatio: 2.2,
    borderRadius: radii.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borders.extraThick,
    borderColor: brand.pink,
    backgroundColor: colors.cream,
  },
  cellMine: {
    borderColor: brand.greenDark,
  },
  cellTaken: {
    borderColor: colors.roadGrayLight,
  },
  innerFrame: {
    ...StyleSheet.absoluteFill,
    margin: 3,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: brand.roadYellow,
    borderStyle: 'dashed',
    zIndex: 2,
  },
  plateImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  plateFallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: brand.pinkLight,
  },
  overlayMine: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(59, 202, 110, 0.28)',
  },
  overlayTaken: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(120, 120, 120, 0.45)',
  },
  labelStack: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    zIndex: 1,
  },
  code: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.roadGray,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    textAlign: 'center',
    color: colors.roadGray,
    marginTop: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textMuted: {
    color: colors.cloudWhite,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
  },
  owner: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.coral,
    marginTop: spacing.xs,
  },
  claimedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: brand.green,
    borderWidth: borders.thick,
    borderColor: brand.greenDark,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 3,
  },
  claimedBadgeText: {
    fontFamily: fonts.displayBold,
    fontSize: 9,
    color: colors.cloudWhite,
  },
});
