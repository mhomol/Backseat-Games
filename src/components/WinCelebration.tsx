import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { borders, colors, fonts, radii, spacing } from '../theme';
import { BigButton } from './BigButton';

type WinCelebrationProps = {
  visible: boolean;
  winnerName: string;
  isWinnerYou?: boolean;
  isHost?: boolean;
  onStartNewGame?: () => void;
  onDismiss: () => void;
  onLeaveHome?: () => void;
};

export function WinCelebration({
  visible,
  winnerName,
  isWinnerYou = false,
  isHost = false,
  onStartNewGame,
  onDismiss,
  onLeaveHome,
}: WinCelebrationProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      animationRef.current?.play();
    }
  }, [visible]);

  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LottieView
            ref={animationRef}
            autoPlay
            loop
            style={styles.lottie}
            source={require('../../assets/celebration.json')}
          />
          <Text style={styles.title}>Winner!</Text>
          <Text style={styles.subtitle}>
            {winnerName === 'Nobody scored'
              ? 'Great spotting — play again soon!'
              : winnerName.includes(' and ') || winnerName.includes(',')
                ? `${winnerName} take the road!`
                : isWinnerYou
                  ? 'You take the road!'
                  : `${winnerName} takes the road!`}
          </Text>
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
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    color: colors.coral,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.roadGray,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
