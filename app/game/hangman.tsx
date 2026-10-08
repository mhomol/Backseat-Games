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
import { HangmanDrawing } from '@/components/HangmanDrawing';
import { useGameSessionGuard } from '@/hooks/useGameSessionGuard';
import { useSessionGameScenery } from '@/hooks/useSessionGameScenery';
import { pickHangmanPhrase } from '@/data/hangmanDictionary';
import { loadHangmanSolved, markHangmanSolved } from '@/services/hangmanSolvedStorage';
import { playClaimFeedback, playInvalidFeedback } from '@/services/feedback';
import { useSessionStore } from '@/store/sessionStore';
import { getSessionWinnerDisplay } from '@/utils/winnerLabel';
import { brand, borders, colors, fonts, radii, spacing } from '@/theme';

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
    void loadHangmanSolved()
      .then((solved) => {
        if (cancelled) {
          return;
        }
        const phrase = pickHangmanPhrase(gameState.soloDifficulty ?? 'medium', solved);
        dispatchAction({ type: 'SUBMIT_HANGMAN_SECRET', phrase });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setWordError(error instanceof Error ? error.message : 'Could not pick a word');
      })
      .finally(() => {
        if (!cancelled) {
          setFetchingWord(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    dispatchAction,
    gameState?.mode,
    gameState?.round,
    gameState?.roundPhase,
    gameState?.soloDifficulty,
  ]);

  useEffect(() => {
    if (!session || !gameState || gameState.mode !== 'solo' || session.phase !== 'finished') {
      return;
    }
    if (session.winnerId !== localPlayerId || !gameState.secretWord) {
      return;
    }
    void markHangmanSolved(gameState.secretWord);
  }, [session, gameState, localPlayerId]);

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
        outcome={winnerDisplay?.outcome}
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
                <Text style={styles.fetchText}>{wordError ?? 'Could not pick a word'}</Text>
                <BigButton
                  label="Retry"
                  onPress={() => {
                    setWordError(null);
                    setFetchingWord(true);
                    void loadHangmanSolved()
                      .then((solved) => {
                        const phrase = pickHangmanPhrase(
                          gameState.soloDifficulty ?? 'medium',
                          solved,
                        );
                        dispatchAction({ type: 'SUBMIT_HANGMAN_SECRET', phrase });
                      })
                      .catch((error: unknown) => {
                        setWordError(
                          error instanceof Error ? error.message : 'Could not pick a word',
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
                <HangmanMask mask={gameState.displayMask} />
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
                    <Text style={styles.letterText} allowFontScaling={false}>
                      {letter}
                    </Text>
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

function HangmanMask({ mask }: { mask: string }) {
  const tokens = mask.length > 0 ? mask.split(' ') : ['_'];
  return (
    <View style={styles.maskRow}>
      {tokens.map((token, index) => {
        if (token === '') {
          if (tokens[index - 1] === '') {
            return null;
          }
          return <View key={`gap-${index}`} style={styles.wordGap} />;
        }
        if (token === '_') {
          return (
            <View key={`dash-${index}`} style={styles.dashTile}>
              <View style={styles.dashBar} />
            </View>
          );
        }
        return (
          <View key={`letter-${index}`} style={styles.maskTile}>
            <Text style={styles.maskLetter} allowFontScaling={false}>
              {token}
            </Text>
          </View>
        );
      })}
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
  maskRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  wordGap: {
    width: 12,
  },
  dashTile: {
    width: 28,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.cream,
    borderWidth: borders.thick,
    borderColor: brand.wood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashBar: {
    width: 16,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sunnyYellow,
    borderWidth: 1,
    borderColor: colors.sunnyYellowDark,
  },
  maskTile: {
    width: 28,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.cream,
    borderWidth: borders.thick,
    borderColor: brand.wood,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskLetter: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    lineHeight: 22,
    color: colors.coral,
    textAlign: 'center',
    includeFontPadding: false,
  },
  secretHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.cream,
    textAlign: 'center',
    marginTop: spacing.sm,
    textShadowColor: colors.roadGray,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    overflow: 'hidden',
  },
  letterUsed: {
    opacity: 0.35,
  },
  letterInert: {
    opacity: 0.55,
  },
  letterText: {
    fontFamily: fonts.displayBold,
    fontSize: 16,
    lineHeight: 18,
    color: colors.roadGray,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
