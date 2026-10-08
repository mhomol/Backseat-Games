import phrases from './hangmanPhrases.json';
import { normalizeHangmanPhrase } from '../games/hangman';
import type { HangmanDifficulty } from '../types/preferences';

export type { HangmanDifficulty };

export const HANGMAN_DIFFICULTIES: HangmanDifficulty[] = ['easy', 'medium', 'hard'];

const POOLS: Record<HangmanDifficulty, string[]> = {
  easy: phrases.easy.map(normalizeHangmanPhrase).filter(Boolean),
  medium: phrases.medium.map(normalizeHangmanPhrase).filter(Boolean),
  hard: phrases.hard.map(normalizeHangmanPhrase).filter(Boolean),
};

export function hangmanPool(difficulty: HangmanDifficulty): string[] {
  return POOLS[difficulty];
}

export function pickHangmanPhrase(
  difficulty: HangmanDifficulty,
  solvedNormalized: string[],
  random: () => number = Math.random,
): string {
  const pool = hangmanPool(difficulty);
  const solved = new Set(solvedNormalized.map(normalizeHangmanPhrase));
  const unused = pool.filter((phrase) => !solved.has(phrase));
  const source = unused.length > 0 ? unused : pool;
  const index = Math.floor(random() * source.length);
  return source[Math.min(index, source.length - 1)];
}
