import { useMemo, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { playBingoFeedback, playClaimFeedback, playTruckHornFeedback } from '@/services/feedback';
import { ContentCapsule } from '@/components/brand/ContentCapsule';
import { SceneryScreenFrame } from '@/components/brand/SceneryScreenFrame';
import { GameEndBar } from '@/components/GameEndBar';
import { GameSessionOverlays } from '@/components/GameSessionOverlays';
import { bingoImageForCategory } from '@/data/bingoCategoryImages';
import {
  BINGO_SIZE,
  FREE_CENTER_INDEX,
  getBingoSquareLabel,
  wouldCompleteBingo,
} from '@/games/bingo';
import { useGameSessionGuard } from '@/hooks/useGameSessionGuard';
import { useSessionGameScenery } from '@/hooks/useSessionGameScenery';
import { useSessionStore } from '@/store/sessionStore';
import { getSessionWinnerDisplay } from '@/utils/winnerLabel';
import { borders, colors, fonts, radii, spacing } from '@/theme';

export default function BingoScreen() {
  const guard = useGameSessionGuard();
  const session = useSessionStore((state) => state.session);
  const localPlayerId = useSessionStore((state) => state.localPlayerId);
  const dispatchAction = useSessionStore((state) => state.dispatchAction);
  const scenerySource = useSessionGameScenery();

  const requestEnd = useCallback(() => guard.requestEndGame(), [guard]);

  const gameState = session?.gameState?.type === 'bingo' ? session.gameState : null;
  const card = gameState?.cards[localPlayerId];
  const marked = gameState?.marked[localPlayerId];

  const winnerDisplay = useMemo(() => {
    if (!session) {
      return null;
    }
    return getSessionWinnerDisplay(session, localPlayerId);
  }, [session, localPlayerId]);

  if (!gameState || !card || !marked || !session) {
    return null;
  }

  return (
    <SceneryScreenFrame scenerySource={scenerySource}>
      <GameSessionOverlays
        guard={guard}
        winnerHeadline={winnerDisplay?.headline}
        isWinnerYou={winnerDisplay?.isYou}
      />
      <View style={styles.playArea}>
        <ContentCapsule style={styles.instructionsCapsule}>
          <Text style={styles.instructions}>Tap a square when you spot it!</Text>
        </ContentCapsule>
        <View style={styles.grid}>
          {Array.from({ length: BINGO_SIZE }).map((_, index) => {
            const { label, icon, category } = getBingoSquareLabel(card, index);
            const isMarked = marked[index];
            return (
              <BingoCell
                key={index}
                label={label}
                icon={icon}
                category={category}
                isMarked={isMarked}
                isFree={index === FREE_CENTER_INDEX}
                onPress={() => {
                  if (isMarked && index !== FREE_CENTER_INDEX) {
                    void playClaimFeedback();
                    dispatchAction({ type: 'UNMARK_BINGO', index });
                  } else if (!isMarked) {
                    const winMode = session.gameRules.bingo.winMode;
                    if (wouldCompleteBingo(marked, index, winMode)) {
                      void playBingoFeedback();
                      void playTruckHornFeedback();
                    } else {
                      void playClaimFeedback();
                    }
                    dispatchAction({ type: 'MARK_BINGO', index });
                  }
                }}
              />
            );
          })}
        </View>
      </View>
      {guard.isInProgress ? (
        <GameEndBar isHost={guard.isHost} onPress={requestEnd} />
      ) : null}
    </SceneryScreenFrame>
  );
}

function BingoCell({
  label,
  icon,
  category,
  isMarked,
  isFree,
  onPress,
}: {
  label: string;
  icon: string;
  category?: string;
  isMarked: boolean;
  isFree: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const stampScale = useSharedValue(isMarked ? 1 : 0);
  const categoryImage = bingoImageForCategory(category);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const stampStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stampScale.value }],
    opacity: stampScale.value,
  }));

  return (
    <Animated.View style={[styles.cellWrap, animatedStyle]}>
      <Pressable
        onPress={() => {
          if (!isMarked) {
            stampScale.value = withSequence(
              withTiming(1.25, { duration: 120 }),
              withSpring(1),
            );
          }
          onPress();
        }}
        onPressIn={() => {
          scale.value = withSpring(0.94);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[
          styles.cell,
          isMarked && styles.cellMarked,
          isFree && styles.cellFree,
        ]}
      >
        {categoryImage ? (
          <Image source={categoryImage} style={styles.iconImage} resizeMode="contain" />
        ) : (
          <Text style={styles.icon}>{icon}</Text>
        )}
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
        {isMarked ? (
          <Animated.Text style={[styles.stamp, stampStyle]}>✓</Animated.Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  playArea: {
    flex: 1,
  },
  instructionsCapsule: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  instructions: {
    fontFamily: fonts.bodyBold,
    textAlign: 'center',
    color: colors.roadGray,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cellWrap: {
    width: '19%',
    aspectRatio: 1,
    padding: 2,
  },
  cell: {
    flex: 1,
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  cellMarked: {
    backgroundColor: '#FFF3B0',
    borderColor: colors.sunnyYellowDark,
  },
  cellFree: {
    backgroundColor: '#E8F8EA',
    borderColor: colors.grassGreenDark,
  },
  icon: {
    fontSize: 16,
  },
  iconImage: {
    width: 22,
    height: 22,
    marginBottom: 1,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 8,
    textAlign: 'center',
    color: colors.roadGray,
  },
  stamp: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontFamily: fonts.displayBold,
    color: colors.grassGreenDark,
    fontSize: 14,
  },
});
