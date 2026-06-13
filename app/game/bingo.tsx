import { useMemo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { playHornFeedback } from '@/services/feedback';
import { ContentCapsule } from '@/components/brand/ContentCapsule';
import { SceneryScreenFrame } from '@/components/brand/SceneryScreenFrame';
import { GameEndBar } from '@/components/GameEndBar';
import { GameSessionOverlays } from '@/components/GameSessionOverlays';
import {
  BINGO_SIZE,
  FREE_CENTER_INDEX,
  getBingoSquareLabel,
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
          const { label, icon } = getBingoSquareLabel(card, index);
          const isMarked = marked[index];
          return (
            <BingoCell
              key={index}
              label={label}
              icon={icon}
              isMarked={isMarked}
              isFree={index === FREE_CENTER_INDEX}
              onPress={() => {
                void playHornFeedback();
                if (isMarked && index !== FREE_CENTER_INDEX) {
                  dispatchAction({ type: 'UNMARK_BINGO', index });
                } else if (!isMarked) {
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
  isMarked,
  isFree,
  onPress,
}: {
  label: string;
  icon: string;
  isMarked: boolean;
  isFree: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.cellWrap, animatedStyle]}>
      <Pressable
        onPress={onPress}
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
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
        {isMarked ? <Text style={styles.stamp}>✓</Text> : null}
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
