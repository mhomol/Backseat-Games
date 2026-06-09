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

export function wordMatchesLetter(word: string, letter: string): boolean {
  const normalized = normalizeWord(word);
  if (normalized.length < 2) {
    return false;
  }
  if (/^\d+$/.test(normalized)) {
    return false;
  }
  const upperLetter = letter.toUpperCase();
  if (SPECIAL_LETTERS.has(upperLetter)) {
    return normalized.includes(upperLetter.toLowerCase());
  }
  return normalized.startsWith(upperLetter.toLowerCase());
}

export function lettersCompleted(currentLetter: string): number {
  const index = ALPHABET.indexOf(currentLetter);
  return index === -1 ? 0 : index;
}

export function hasReachedZ(currentLetter: string): boolean {
  return currentLetter === 'Z' && lettersCompleted('Z') === 25;
}
