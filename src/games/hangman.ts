import type { ApplyResult, GameAction, HangmanState, SessionState } from '../types/game';

export const HANGMAN_SOLO_PUZZLE_ID = '__hangman_puzzle__';
export const HANGMAN_MAX_PLAYERS = 2;

const LETTER_RE = /^[A-Z]$/;

export function normalizeHangmanPhrase(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildHangmanMask(secret: string, guessedLetters: string[]): string {
  const guessed = new Set(guessedLetters);
  return secret
    .split('')
    .map((ch) => {
      if (ch === ' ') {
        return ' ';
      }
      return guessed.has(ch) ? ch : '_';
    })
    .join(' ');
}

export function isHangmanPuzzleComplete(secret: string, guessedLetters: string[]): boolean {
  const guessed = new Set(guessedLetters);
  return secret.split('').every((ch) => ch === ' ' || guessed.has(ch));
}

export function stripHangmanSecret(session: SessionState): SessionState {
  if (session.gameState?.type !== 'hangman') {
    return session;
  }
  return {
    ...session,
    gameState: {
      ...session.gameState,
      secretWord: null,
    },
  };
}

export function createHangmanState(session: SessionState): HangmanState {
  const host = session.players.find((player) => player.isHost) ?? session.players[0];
  const guest = session.players.find((player) => player.id !== host.id) ?? null;
  const solo = !guest;
  const scores: Record<string, number> = {};
  for (const player of session.players) {
    scores[player.id] = 0;
  }

  return {
    type: 'hangman',
    mode: solo ? 'solo' : 'versus',
    round: 1,
    supplierId: solo ? null : host.id,
    guesserId: solo ? host.id : guest.id,
    secretWord: null,
    displayMask: '',
    guessedLetters: [],
    missCount: 0,
    maxMisses: session.gameRules.hangman.maxMisses,
    scores,
    roundPhase: 'awaiting-secret',
    winnerId: null,
  };
}

function emptyBoard(state: HangmanState): Pick<
  HangmanState,
  'secretWord' | 'displayMask' | 'guessedLetters' | 'missCount'
> {
  return {
    secretWord: null,
    displayMask: '',
    guessedLetters: [],
    missCount: 0,
  };
}

function beginNextRound(state: HangmanState): HangmanState {
  const nextSupplier = state.guesserId;
  const nextGuesser = state.supplierId ?? state.guesserId;
  return {
    ...state,
    ...emptyBoard(state),
    round: state.round + 1,
    supplierId: nextSupplier,
    guesserId: nextGuesser,
    roundPhase: 'awaiting-secret',
    winnerId: null,
  };
}

function withHangman(
  session: SessionState,
  state: HangmanState,
  extra: Partial<SessionState> = {},
): SessionState {
  return {
    ...session,
    lastRejection: null,
    gameState: state,
    ...extra,
  };
}

export function applyHangmanAction(
  session: SessionState,
  playerId: string,
  action: GameAction,
): ApplyResult {
  if (session.gameState?.type !== 'hangman') {
    return { ok: false, reason: 'Wrong game type.' };
  }

  const state = session.gameState;
  if (state.roundPhase === 'match-over' || state.winnerId) {
    return { ok: false, reason: 'Game already has a winner.' };
  }

  if (action.type === 'SUBMIT_HANGMAN_SECRET') {
    if (state.roundPhase !== 'awaiting-secret') {
      return { ok: false, reason: 'A word is already in play.' };
    }
    const canSubmit =
      state.mode === 'solo' ? playerId === state.guesserId : playerId === state.supplierId;
    if (!canSubmit) {
      return { ok: false, reason: 'Only the word supplier can submit.' };
    }
    const phrase = normalizeHangmanPhrase(action.phrase);
    if (!phrase || !/[A-Z]/.test(phrase)) {
      return { ok: false, reason: 'Enter a word or phrase with letters.' };
    }
    return {
      ok: true,
      state: withHangman(session, {
        ...state,
        secretWord: phrase,
        displayMask: buildHangmanMask(phrase, []),
        guessedLetters: [],
        missCount: 0,
        roundPhase: 'guessing',
      }),
    };
  }

  if (action.type === 'GUESS_HANGMAN_LETTER') {
    if (state.roundPhase !== 'guessing' || !state.secretWord) {
      return { ok: false, reason: 'Waiting for a word.' };
    }
    if (playerId !== state.guesserId) {
      return { ok: false, reason: 'Only the guesser can pick letters.' };
    }
    const letter = action.letter.toUpperCase();
    if (!LETTER_RE.test(letter)) {
      return { ok: false, reason: 'Pick a letter A–Z.' };
    }
    if (state.guessedLetters.includes(letter)) {
      return { ok: false, reason: 'That letter was already tried.' };
    }

    const guessedLetters = [...state.guessedLetters, letter];
    const hit = state.secretWord.includes(letter);
    const missCount = hit ? state.missCount : state.missCount + 1;
    const displayMask = buildHangmanMask(state.secretWord, guessedLetters);
    const solved = isHangmanPuzzleComplete(state.secretWord, guessedLetters);
    const hung = missCount >= state.maxMisses;
    const pointsToWin = session.gameRules.hangman.pointsToWin;

    if (state.mode === 'solo') {
      if (solved) {
        const nextState: HangmanState = {
          ...state,
          guessedLetters,
          missCount,
          displayMask,
          roundPhase: 'match-over',
          winnerId: playerId,
        };
        return {
          ok: true,
          state: withHangman(session, nextState, {
            phase: 'finished',
            winnerId: playerId,
          }),
        };
      }
      if (hung) {
        const nextState: HangmanState = {
          ...state,
          guessedLetters,
          missCount,
          displayMask,
          roundPhase: 'match-over',
          winnerId: HANGMAN_SOLO_PUZZLE_ID,
        };
        return {
          ok: true,
          state: withHangman(session, nextState, {
            phase: 'finished',
            winnerId: HANGMAN_SOLO_PUZZLE_ID,
          }),
        };
      }
      return {
        ok: true,
        state: withHangman(session, {
          ...state,
          guessedLetters,
          missCount,
          displayMask,
        }),
      };
    }

    if (solved || hung) {
      const scorerId = solved ? state.guesserId : state.supplierId!;
      const scores = {
        ...state.scores,
        [scorerId]: (state.scores[scorerId] ?? 0) + 1,
      };
      const matchWinner =
        scores[scorerId] >= pointsToWin ? scorerId : null;
      if (matchWinner) {
        const nextState: HangmanState = {
          ...state,
          guessedLetters,
          missCount,
          displayMask,
          scores,
          roundPhase: 'match-over',
          winnerId: matchWinner,
        };
        return {
          ok: true,
          state: withHangman(session, nextState, {
            phase: 'finished',
            winnerId: matchWinner,
          }),
        };
      }
      return {
        ok: true,
        state: withHangman(
          session,
          beginNextRound({
            ...state,
            guessedLetters,
            missCount,
            displayMask,
            scores,
          }),
        ),
      };
    }

    return {
      ok: true,
      state: withHangman(session, {
        ...state,
        guessedLetters,
        missCount,
        displayMask,
      }),
    };
  }

  return { ok: false, reason: 'Invalid action for Hangman.' };
}

export function resolveHangmanWinner(session: SessionState): string | null {
  if (session.gameState?.type !== 'hangman') {
    return session.winnerId;
  }
  const state = session.gameState;
  if (state.winnerId) {
    return state.winnerId;
  }
  if (state.mode === 'solo') {
    return null;
  }
  const entries = session.players.map((player) => ({
    playerId: player.id,
    score: state.scores[player.id] ?? 0,
  }));
  const max = Math.max(...entries.map((entry) => entry.score));
  const leaders = entries.filter((entry) => entry.score === max);
  return max > 0 && leaders.length === 1 ? leaders[0].playerId : null;
}
