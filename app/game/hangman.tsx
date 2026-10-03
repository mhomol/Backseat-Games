import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BigButton } from '@/components/BigButton';
import { ContentCapsule } from '@/components/brand/ContentCapsule';
import { SceneryScreenFrame } from '@/components/brand/SceneryScreenFrame';
import { GameEndBar } from '@/components/GameEndBar';
import { GameSessionOverlays } from '@/components/GameSessionOverlays';
import { useGameSessionGuard } from '@/hooks/useGameSessionGuard';
import { useSessionGameScenery } from '@/hooks/useSessionGameScenery';
import { fetchHangmanPhrase } from '@/services/hangmanWordApi';
import { playClaimFeedback, playInvalidFeedback } from '@/services/feedback';
import { useSessionStore } from '@/store/sessionStore';
import { getSessionWinnerDisplay } from '@/utils/winnerLabel';
import { borders, colors, fonts, radii, spacing } from '@/theme';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function HangmanScreen() {
  const guard = useGameSessionGuard();
  const session = useSessionStore((state) => state.session);
  const localPlayerId = useSessionStore((state) => state.localPlayerId);
  const dispatchAction = useSessionStore((state) => state.dispatchAction);
  const scenerySource = useSessionGameScenery();
  const [phraseDraft, setPhraseDraft] = useState('');
  const [localSecret, setLocalSecret] = useState<string | null>(null);
  const [wordError, setWordError] = useState<string | null>(null);
  const [fetchingWord, setFetchingWord] = useState(false);

  const requestEnd = useCallback(() => guard.requestEndGame(), [guard]);

  const gameState = session?.gameState?.type === 'hangman' ? session.gameState : null;
  const isGuesser = gameState?.guesserId === localPlayerId;
  const isSupplier = gameState?.supplierId === localPlayerId;
  const canSeeSecret = Boolean(isSupplier);

  const winnerDisplay = useMemo(() => {
    if (!session) {
      return null;
    }
    return getSessionWinnerDisplay(session, localPlayerId);
  }, [session, localPlayerId]);

  useEffect(() => {
    if (!gameState || gameState.mode !== 'solo' || gameState.roundPhase !== 'awaiting-secret') {
      return;
    }
    let cancelled = false;
    setFetchingWord(true);
    setWordError(null);
    void fetchHangmanPhrase()
      .then((phrase) => {
        if (cancelled) {
          return;
        }
        dispatchAction({ type: 'SUBMIT_HANGMAN_SECRET', phrase });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setWordError(error instanceof Error ? error.message : 'Need internet to pick a word');
      })
      .finally(() => {
        if (!cancelled) {
          setFetchingWord(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dispatchAction, gameState?.mode, gameState?.round, gameState?.roundPhase]);

  useEffect(() => {
    if (gameState?.roundPhase === 'awaiting-secret') {
      setPhraseDraft('');
      setLocalSecret(null);
    }
  }, [gameState?.round, gameState?.roundPhase]);

  if (!gameState || !session) {
    return null;
  }

  const secretForSupplier = gameState.secretWord ?? localSecret;
  const scoresLine = session.players
    .map((player) => `${player.name} ${gameState.scores[player.id] ?? 0}`)
    .join('  ·  ');

  return (
    <SceneryScreenFrame scenerySource={scenerySource}>
      <GameSessionOverlays
        guard={guard}
        winnerHeadline={winnerDisplay?.headline}
        isWinnerYou={winnerDisplay?.isYou}
      />
      <View style={styles.playArea}>
        <ContentCapsule style={styles.statusCapsule}>
          <Text style={styles.status}>
            {gameState.mode === 'versus'
              ? `Round ${gameState.round} · first to ${session.gameRules.hangman.pointsToWin}`
              : 'Guess the word before the drawing is done'}
          </Text>
          {gameState.mode === 'versus' ? <Text style={styles.scores}>{scoresLine}</Text> : null}
          {isGuesser ? (
            <Text style={styles.role}>You are guessing</Text>
          ) : isSupplier ? (
            <Text style={styles.role}>You supplied the word — watch the board</Text>
          ) : null}
        </ContentCapsule>

        {gameState.roundPhase === 'awaiting-secret' && gameState.mode === 'solo' ? (
          <ContentCapsule>
            {fetchingWord ? (
              <View style={styles.fetchRow}>
                <ActivityIndicator color={colors.skyBlueDark} />
                <Text style={styles.fetchText}>Picking a word…</Text>
              </View>
            ) : (
              <>
                <Text style={styles.fetchText}>{wordError ?? 'Need internet to pick a word'}</Text>
                <BigButton
                  label="Retry"
                  onPress={() => {
                    setWordError(null);
                    setFetchingWord(true);
                    void fetchHangmanPhrase()
                      .then((phrase) => dispatchAction({ type: 'SUBMIT_HANGMAN_SECRET', phrase }))
                      .catch((error: unknown) => {
                        setWordError(
                          error instanceof Error ? error.message : 'Need internet to pick a word',
                        );
                      })
                      .finally(() => setFetchingWord(false));
                  }}
                />
              </>
            )}
          </ContentCapsule>
        ) : null}

        {gameState.roundPhase === 'awaiting-secret' && isSupplier ? (
          <ContentCapsule>
            <Text style={styles.submitLabel}>Type a word or short phrase</Text>
            <TextInput
              value={phraseDraft}
              onChangeText={setPhraseDraft}
              placeholder="e.g. rest stop"
              placeholderTextColor={colors.roadGrayLight}
              autoCapitalize="characters"
              style={styles.input}
            />
            <BigButton
              label="Submit word"
              onPress={() => {
                const phrase = phraseDraft.trim();
                setLocalSecret(phrase.toUpperCase());
                dispatchAction({ type: 'SUBMIT_HANGMAN_SECRET', phrase });
              }}
            />
          </ContentCapsule>
        ) : null}

        {gameState.roundPhase === 'awaiting-secret' && isGuesser && gameState.mode === 'versus' ? (
          <ContentCapsule>
            <Text style={styles.fetchText}>Waiting for the other player to pick a word…</Text>
          </ContentCapsule>
        ) : null}

        {gameState.roundPhase !== 'awaiting-secret' ? (
          <>
            <View style={styles.boardRow}>
              <View style={styles.maskColumn}>
                <Text style={styles.mask}>{gameState.displayMask || '—'}</Text>
                {canSeeSecret && secretForSupplier ? (
                  <Text style={styles.secretHint}>Answer: {secretForSupplier}</Text>
                ) : null}
              </View>
              <HangmanDrawing missCount={gameState.missCount} maxMisses={gameState.maxMisses} />
            </View>
            <View style={styles.pad}>
              {LETTERS.map((letter) => {
                const used = gameState.guessedLetters.includes(letter);
                return (
                  <Pressable
                    key={letter}
                    disabled={!isGuesser || used || gameState.roundPhase !== 'guessing'}
                    onPress={() => {
                      const hit = (gameState.secretWord ?? '').includes(letter);
                      if (used) {
                        return;
                      }
                      if (gameState.secretWord) {
                        void (hit ? playClaimFeedback() : playInvalidFeedback());
                      } else {
                        void playClaimFeedback();
                      }
                      dispatchAction({ type: 'GUESS_HANGMAN_LETTER', letter });
                    }}
                    style={[
                      styles.letter,
                      used && styles.letterUsed,
                      (!isGuesser || gameState.roundPhase !== 'guessing') && styles.letterInert,
                    ]}
                  >
                    <Text style={styles.letterText}>{letter}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
      </View>
      {guard.isInProgress ? (
        <GameEndBar isHost={guard.isHost} onPress={requestEnd} />
      ) : null}
    </SceneryScreenFrame>
  );
}

function HangmanDrawing({ missCount, maxMisses }: { missCount: number; maxMisses: number }) {
  const stage = Math.min(missCount, maxMisses);
  return (
    <View style={styles.gallows} accessibilityLabel={`Hangman drawing, ${stage} of ${maxMisses} misses`}>
      <View style={styles.gallowsBase} />
      <View style={styles.gallowsPost} />
      <View style={styles.gallowsBeam} />
      <View style={styles.gallowsRope} />
      {stage >= 1 ? <View style={styles.head} /> : null}
      {stage >= 2 ? <View style={styles.body} /> : null}
      {stage >= 3 ? <View style={[styles.arm, styles.armLeft]} /> : null}
      {stage >= 4 ? <View style={[styles.arm, styles.armRight]} /> : null}
      {stage >= 5 ? <View style={[styles.leg, styles.legLeft]} /> : null}
      {stage >= 6 ? <View style={[styles.leg, styles.legRight]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  playArea: {
    flex: 1,
    gap: spacing.md,
  },
  statusCapsule: {
    paddingVertical: spacing.sm,
  },
  status: {
    fontFamily: fonts.bodyBold,
    textAlign: 'center',
    color: colors.roadGray,
  },
  scores: {
    fontFamily: fonts.body,
    textAlign: 'center',
    color: colors.roadGrayLight,
    marginTop: spacing.xs,
  },
  role: {
    fontFamily: fonts.body,
    textAlign: 'center',
    color: colors.skyBlueDark,
    marginTop: spacing.xs,
  },
  fetchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fetchText: {
    fontFamily: fonts.body,
    textAlign: 'center',
    color: colors.roadGray,
  },
  submitLabel: {
    fontFamily: fonts.bodyBold,
    color: colors.roadGray,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.md,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.roadGray,
    marginBottom: spacing.sm,
  },
  boardRow: {
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm,
    minHeight: 160,
  },
  maskColumn: {
    flex: 2,
    justifyContent: 'center',
  },
  mask: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    letterSpacing: 2,
    color: colors.roadGray,
    textAlign: 'center',
  },
  secretHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.roadGrayLight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  gallows: {
    flex: 1,
    minWidth: 90,
    maxWidth: 130,
    height: 180,
    alignSelf: 'center',
  },
  gallowsBase: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 72,
    height: 6,
    backgroundColor: colors.roadGray,
    borderRadius: 2,
  },
  gallowsPost: {
    position: 'absolute',
    bottom: 14,
    left: 20,
    width: 6,
    height: 150,
    backgroundColor: colors.roadGray,
  },
  gallowsBeam: {
    position: 'absolute',
    top: 16,
    left: 20,
    width: 70,
    height: 6,
    backgroundColor: colors.roadGray,
  },
  gallowsRope: {
    position: 'absolute',
    top: 22,
    left: 80,
    width: 3,
    height: 18,
    backgroundColor: colors.roadGrayLight,
  },
  head: {
    position: 'absolute',
    top: 38,
    left: 68,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3,
    borderColor: colors.roadGray,
  },
  body: {
    position: 'absolute',
    top: 64,
    left: 79,
    width: 4,
    height: 42,
    backgroundColor: colors.roadGray,
  },
  arm: {
    position: 'absolute',
    top: 72,
    width: 28,
    height: 4,
    backgroundColor: colors.roadGray,
  },
  armLeft: {
    left: 54,
    transform: [{ rotate: '-22deg' }],
  },
  armRight: {
    left: 80,
    transform: [{ rotate: '22deg' }],
  },
  leg: {
    position: 'absolute',
    top: 102,
    width: 30,
    height: 4,
    backgroundColor: colors.roadGray,
  },
  legLeft: {
    left: 54,
    transform: [{ rotate: '28deg' }],
  },
  legRight: {
    left: 78,
    transform: [{ rotate: '-28deg' }],
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  letter: {
    width: '11%',
    minWidth: 32,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.roadGrayLight,
    borderRadius: radii.sm,
  },
  letterUsed: {
    opacity: 0.35,
  },
  letterInert: {
    opacity: 0.55,
  },
  letterText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGray,
  },
});
