import type { SignGameRules } from '../types/preferences';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const SPECIAL_LETTERS = new Set(['Q', 'X', 'Z']);

export function normalizeWord(word: string): string {
  return word.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getNextLetter(current: string): string | null {
  const index = ALPHABET.indexOf(current);
  if (index === -1 || index >= ALPHABET.length - 1) {
    return null;
  }
  return ALPHABET[index + 1];
}

export function wordMatchesLetter(
  word: string,
  letter: string,
  rules?: Pick<SignGameRules, 'qxzMatchMode'>,
): boolean {
  const normalized = normalizeWord(word);
  if (normalized.length < 2) {
    return false;
  }
  if (/^\d+$/.test(normalized)) {
    return false;
  }
  const upperLetter = letter.toUpperCase();
  const useAnywhere =
    rules?.qxzMatchMode === 'anywhere' && SPECIAL_LETTERS.has(upperLetter);
  if (useAnywhere) {
    return normalized.includes(upperLetter.toLowerCase());
  }
  return normalized.startsWith(upperLetter.toLowerCase());
}

export function letterMatchHint(letter: string, rules?: Pick<SignGameRules, 'qxzMatchMode'>): string {
  const upperLetter = letter.toUpperCase();
  const useAnywhere =
    rules?.qxzMatchMode === 'anywhere' && SPECIAL_LETTERS.has(upperLetter);
  if (useAnywhere) {
    return `Find a word with the letter ${upperLetter} in it`;
  }
  return `Find a word that starts with ${upperLetter}`;
}

export function letterMatchRejection(letter: string, rules?: Pick<SignGameRules, 'qxzMatchMode'>): string {
  const upperLetter = letter.toUpperCase();
  const useAnywhere =
    rules?.qxzMatchMode === 'anywhere' && SPECIAL_LETTERS.has(upperLetter);
  if (useAnywhere) {
    return `Letter ${upperLetter} must appear in the word.`;
  }
  return `Word must start with ${upperLetter}.`;
}

export function lettersCompleted(currentLetter: string): number {
  const index = ALPHABET.indexOf(currentLetter);
  return index === -1 ? 0 : index;
}

export function hasReachedZ(currentLetter: string): boolean {
  return currentLetter === 'Z' && lettersCompleted('Z') === 25;
}
