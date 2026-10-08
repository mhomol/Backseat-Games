import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { playInvalidFeedback, playTruckHornFeedback, playWinFeedback } from '../services/feedback';
import { borders, colors, fonts, radii, spacing } from '../theme';
import type { WinnerOutcome } from '../utils/winnerLabel';
import { BigButton } from './BigButton';

type WinCelebrationProps = {
  visible: boolean;
  winnerName: string;
  isWinnerYou?: boolean;
  isHost?: boolean;
  outcome?: WinnerOutcome;
  onStartNewGame?: () => void;
  onDismiss: () => void;
  onLeaveHome?: () => void;
};

export function WinCelebration({
  visible,
  winnerName,
  isWinnerYou = false,
  isHost = false,
  outcome = 'win',
  onStartNewGame,
  onDismiss,
  onLeaveHome,
}: WinCelebrationProps) {
  const animationRef = useRef<LottieView>(null);
  const isLoss = outcome === 'loss';

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (isLoss) {
      void playInvalidFeedback();
      return;
    }
    animationRef.current?.play();
    void playWinFeedback();
    void playTruckHornFeedback();
  }, [visible, isLoss]);

  const subtitle = isLoss
    ? 'Out of guesses — try the next stretch.'
    : winnerName === 'Nobody scored'
      ? 'Great spotting — play again soon!'
      : winnerName.includes(' and ') || winnerName.includes(',')
        ? `${winnerName} take the road!`
        : isWinnerYou
          ? 'You take the road!'
          : `${winnerName} takes the road!`;

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {isLoss ? (
            <View style={styles.wrongWay} accessibilityLabel="Wrong way">
              <Text style={styles.wrongWayText}>WRONG</Text>
              <Text style={styles.wrongWayText}>WAY</Text>
            </View>
          ) : (
            <LottieView
              ref={animationRef}
              autoPlay
              loop
              style={styles.lottie}
              source={require('../../assets/celebration.json')}
            />
          )}
          <Text style={[styles.title, isLoss && styles.lossTitle]}>
            {isLoss ? 'Hit the road, Jack!' : 'Winner!'}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {isHost && onStartNewGame ? (
            <>
              <BigButton label="Start new game" onPress={onStartNewGame} variant="accent" />
              <BigButton
                label="Back to home"
                onPress={onLeaveHome ?? onDismiss}
                variant="secondary"
              />
            </>
          ) : (
            <BigButton label="Awesome!" onPress={onDismiss} variant="accent" />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 52, 54, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.cream,
    borderWidth: borders.extraThick,
    borderColor: colors.sunnyYellowDark,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  lottie: {
    width: 180,
    height: 180,
  },
  wrongWay: {
    width: 168,
    height: 112,
    backgroundColor: colors.coral,
    borderWidth: borders.extraThick,
    borderColor: colors.cloudWhite,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  wrongWayText: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.cloudWhite,
    letterSpacing: 2,
    lineHeight: 32,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    color: colors.coral,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  lossTitle: {
    fontSize: 28,
    color: colors.roadGray,
  },
  subtitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.roadGray,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
