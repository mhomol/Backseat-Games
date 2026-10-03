import { useMemo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { FREE_CENTER_INDEX, BINGO_SIZE } from '@/games/bingo';
import { getColorCatchSquare, wouldCompleteColorCatch } from '@/games/colorCatch';
import { useGameSessionGuard } from '@/hooks/useGameSessionGuard';
import { useSessionGameScenery } from '@/hooks/useSessionGameScenery';
import { useSessionStore } from '@/store/sessionStore';
import { getSessionWinnerDisplay } from '@/utils/winnerLabel';
import { borders, colors, fonts, radii, spacing } from '@/theme';

function contrastInk(hex: string): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? colors.roadGray : colors.cloudWhite;
}

export default function ColorCatchScreen() {
  const guard = useGameSessionGuard();
  const session = useSessionStore((state) => state.session);
  const localPlayerId = useSessionStore((state) => state.localPlayerId);
  const dispatchAction = useSessionStore((state) => state.dispatchAction);
  const scenerySource = useSessionGameScenery();

  const requestEnd = useCallback(() => guard.requestEndGame(), [guard]);

  const gameState = session?.gameState?.type === 'color-catch' ? session.gameState : null;
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
          <Text style={styles.instructions}>Tap a square when you spot that vehicle color!</Text>
        </ContentCapsule>
        <View style={styles.grid}>
          {Array.from({ length: BINGO_SIZE }).map((_, index) => {
            const square = getColorCatchSquare(card, index);
            const isMarked = marked[index];
            return (
              <ColorCell
                key={index}
                label={square.label}
                hex={square.hex}
                isMarked={isMarked}
                isFree={index === FREE_CENTER_INDEX}
                onPress={() => {
                  if (isMarked && index !== FREE_CENTER_INDEX) {
                    void playClaimFeedback();
                    dispatchAction({ type: 'UNMARK_COLOR_CATCH', index });
                  } else if (!isMarked) {
                    const winMode = session.gameRules['color-catch'].winMode;
                    if (wouldCompleteColorCatch(marked, index, winMode)) {
                      void playBingoFeedback();
                      void playTruckHornFeedback();
                    } else {
                      void playClaimFeedback();
                    }
                    dispatchAction({ type: 'MARK_COLOR_CATCH', index });
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

function ColorCell({
  label,
  hex,
  isMarked,
  isFree,
  onPress,
}: {
  label: string;
  hex: string;
  isMarked: boolean;
  isFree: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const stampScale = useSharedValue(isMarked ? 1 : 0);
  const ink = contrastInk(hex);

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
          { backgroundColor: hex },
          isFree && styles.cellFree,
          isMarked && styles.cellMarked,
        ]}
      >
        {isMarked ? <View style={styles.markedWash} pointerEvents="none" /> : null}
        <View style={styles.labelBar} pointerEvents="none">
          <Text style={[styles.label, { color: ink }]} numberOfLines={2}>
            {label}
          </Text>
        </View>
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
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  cellMarked: {
    borderColor: colors.sunnyYellowDark,
  },
  cellFree: {
    borderColor: colors.grassGreenDark,
  },
  markedWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 243, 176, 0.28)',
  },
  labelBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 2,
    paddingVertical: 2,
    minHeight: 20,
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  stamp: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontFamily: fonts.displayBold,
    color: colors.grassGreenDark,
    fontSize: 14,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
