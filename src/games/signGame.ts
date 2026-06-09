import type {
  ApplyResult,
  GameAction,
  SessionState,
  SignGameState,
} from '../types/game';
import {
  getNextLetter,
  normalizeWord,
  wordMatchesLetter,
} from './signGameUtils';

export function createSignGameState(players: SessionState['players']): SignGameState {
  const playerLetters: Record<string, string> = {};
  for (const player of players) {
    playerLetters[player.id] = 'A';
  }
  return {
    type: 'sign-game',
    playerLetters,
    usedWords: [],
    submissions: [],
    winnerId: null,
  };
}

export function applySignGameAction(
  session: SessionState,
  playerId: string,
  action: GameAction,
): ApplyResult {
  if (session.gameState?.type !== 'sign-game') {
    return { ok: false, reason: 'Wrong game type.' };
  }

  const state = session.gameState;
  if (state.winnerId) {
    return { ok: false, reason: 'Game already has a winner.' };
  }

  if (action.type !== 'SUBMIT_SIGN_WORD') {
    return { ok: false, reason: 'Invalid action for Sign Game.' };
  }

  const currentLetter = state.playerLetters[playerId];
  if (!currentLetter) {
    return { ok: false, reason: 'Player not in Sign Game.' };
  }

  if (state.winnerId === playerId) {
    return { ok: false, reason: 'You already finished the alphabet!' };
  }

  if (action.letter.toUpperCase() !== currentLetter) {
    return {
      ok: false,
      reason: `You are on letter ${currentLetter}, not ${action.letter.toUpperCase()}.`,
    };
  }

  const normalized = normalizeWord(action.word);
  if (normalized.length < 2) {
    return { ok: false, reason: 'Word must be at least 2 characters.' };
  }

  if (state.usedWords.includes(normalized)) {
    return { ok: false, reason: 'That word was already used by someone else.' };
  }

  if (!wordMatchesLetter(action.word, currentLetter)) {
    const rule =
      currentLetter === 'Q' || currentLetter === 'X' || currentLetter === 'Z'
        ? `Letter ${currentLetter} must appear in the word.`
        : `Word must start with ${currentLetter}.`;
    return { ok: false, reason: rule };
  }

  const nextLetter = getNextLetter(currentLetter);
  const nextPlayerLetters = { ...state.playerLetters };
  nextPlayerLetters[playerId] = nextLetter ?? 'Z';

  const submission = {
    playerId,
    letter: currentLetter,
    word: action.word.trim(),
    audioUri: action.audioUri,
    timestamp: Date.now(),
  };

  const winnerId =
    currentLetter === 'Z' && nextLetter === null ? playerId : null;

  return {
    ok: true,
    state: {
      ...session,
      phase: winnerId ? 'finished' : session.phase,
      winnerId,
      lastRejection: null,
      gameState: {
        ...state,
        playerLetters: nextPlayerLetters,
        usedWords: [...state.usedWords, normalized],
        submissions: [...state.submissions, submission],
        winnerId,
      },
    },
  };
}

export function getSignGameLeaderboard(
  state: SignGameState,
  players: SessionState['players'],
): Array<{ playerId: string; name: string; lettersDone: number; currentLetter: string }> {
  return players
    .map((player) => {
      const currentLetter = state.playerLetters[player.id] ?? 'A';
      const index = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(currentLetter);
      const lettersDone = currentLetter === 'Z' && state.winnerId === player.id ? 26 : index;
      return {
        playerId: player.id,
        name: player.name,
        lettersDone,
        currentLetter,
      };
    })
    .sort((a, b) => b.lettersDone - a.lettersDone);
}
