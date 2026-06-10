import { useMemo, useCallback, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BigButton } from '@/components/BigButton';
import { GameSessionOverlays } from '@/components/GameSessionOverlays';
import { Scoreboard } from '@/components/Scoreboard';
import { ALPHABET, SPECIAL_LETTERS } from '@/games/signGameUtils';
import { getSignGameLeaderboard } from '@/games/signGame';
import { useGameScreenHeader } from '@/hooks/useGameScreenHeader';
import { useGameSessionGuard } from '@/hooks/useGameSessionGuard';
import { useSessionStore } from '@/store/sessionStore';
import { getSessionWinnerDisplay } from '@/utils/winnerLabel';
import { borders, colors, fonts, radii, spacing } from '@/theme';

export default function SignGameScreen() {
  const guard = useGameSessionGuard();
  const session = useSessionStore((state) => state.session);
  const localPlayerId = useSessionStore((state) => state.localPlayerId);
  const dispatchAction = useSessionStore((state) => state.dispatchAction);
  const [modalOpen, setModalOpen] = useState(false);
  const [word, setWord] = useState('');

  const requestEnd = useCallback(() => guard.requestEndGame(), [guard]);
  useGameScreenHeader({
    title: 'Sign Game',
    showEndButton: guard.isInProgress,
    endLabel: guard.isHost ? 'End Game' : 'Leave',
    onEndPress: requestEnd,
  });

  const gameState = session?.gameState?.type === 'sign-game' ? session.gameState : null;
  const currentLetter = gameState?.playerLetters[localPlayerId] ?? 'A';

  const leaderboard = useMemo(() => {
    if (!gameState || !session) {
      return [];
    }
    return getSignGameLeaderboard(gameState, session.players).map((entry) => ({
      name: entry.name,
      score: entry.lettersDone,
      isYou: entry.playerId === localPlayerId,
    }));
  }, [gameState, session, localPlayerId]);

  const mySubmissions = gameState?.submissions.filter((s) => s.playerId === localPlayerId) ?? [];

  const winnerDisplay = useMemo(() => {
    if (!session) {
      return null;
    }
    return getSessionWinnerDisplay(session, localPlayerId);
  }, [session, localPlayerId]);

  if (!gameState || !session) {
    return null;
  }

  const youWon = session.winnerId === localPlayerId;
  const houseRule = SPECIAL_LETTERS.has(currentLetter);

  const submitWord = () => {
    const trimmed = word.trim();
    if (trimmed.length < 2) {
      return;
    }
    dispatchAction({
      type: 'SUBMIT_SIGN_WORD',
      letter: currentLetter,
      word: trimmed,
    });
    setWord('');
    setModalOpen(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GameSessionOverlays
        guard={guard}
        winnerHeadline={winnerDisplay?.headline}
        isWinnerYou={winnerDisplay?.isYou}
      />
      <Scoreboard scores={leaderboard} />

      <View style={styles.letterCircle}>
        <Text style={styles.letter}>{currentLetter}</Text>
      </View>

      <Text style={styles.rule}>
        {houseRule
          ? `Find a word with the letter ${currentLetter} in it`
          : `Find a word that starts with ${currentLetter}`}
      </Text>

      <View style={styles.progressRow}>
        {ALPHABET.map((letter) => {
          const index = ALPHABET.indexOf(currentLetter);
          const letterIndex = ALPHABET.indexOf(letter);
          const done = letterIndex < index || (youWon && letterIndex <= index);
          const current = letter === currentLetter && !youWon;
          return (
            <View
              key={letter}
              style={[
                styles.progressDot,
                done && styles.progressDone,
                current && styles.progressCurrent,
              ]}
            >
              <Text style={styles.progressText}>{letter}</Text>
            </View>
          );
        })}
      </View>

      <BigButton
        label="I found one!"
        onPress={() => setModalOpen(true)}
        variant="accent"
        disabled={youWon}
      />

      <Text style={styles.historyTitle}>Your finds</Text>
      {mySubmissions.map((entry) => (
        <View key={`${entry.letter}-${entry.timestamp}`} style={styles.historyRow}>
          <Text style={styles.historyLetter}>{entry.letter}</Text>
          <Text style={styles.historyWord}>{entry.word}</Text>
        </View>
      ))}

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Letter {currentLetter}</Text>
            <TextInput
              value={word}
              onChangeText={setWord}
              placeholder="Type the word you saw"
              style={styles.input}
              autoCapitalize="words"
              autoFocus
              onSubmitEditing={submitWord}
            />

            <BigButton
              label="Submit"
              onPress={submitWord}
              disabled={word.trim().length < 2}
            />
            <BigButton label="Cancel" onPress={() => setModalOpen(false)} variant="secondary" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  letterCircle: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.sunnyYellow,
    borderWidth: borders.extraThick,
    borderColor: colors.sunnyYellowDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: fonts.displayBold,
    fontSize: 96,
    color: colors.roadGray,
  },
  rule: {
    fontFamily: fonts.bodyBold,
    textAlign: 'center',
    color: colors.roadGrayLight,
    fontSize: 16,
  },
  progressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  progressDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.plateOther,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDone: {
    backgroundColor: colors.grassGreen,
  },
  progressCurrent: {
    backgroundColor: colors.sunnyYellow,
    borderWidth: 2,
    borderColor: colors.sunnyYellowDark,
  },
  progressText: {
    fontSize: 9,
    fontFamily: fonts.bodyBold,
    color: colors.roadGray,
  },
  historyTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.roadGray,
    marginTop: spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.md,
    padding: spacing.sm,
  },
  historyLetter: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.skyBlueDark,
    width: 24,
  },
  historyWord: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.roadGray,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.roadGray,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.md,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 18,
  },
});
