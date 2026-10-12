export type HangmanMaskToken = {
  kind: 'letter' | 'blank' | 'hyphen';
  char?: string;
};

/** One visual row is one or more whole words (or hyphenated chunks). */
export type HangmanMaskRow = HangmanMaskToken[][];

function tokenFromChar(char: string): HangmanMaskToken {
  if (char === '_') {
    return { kind: 'blank' };
  }
  return { kind: 'letter', char };
}

export function wordsFromHangmanMask(mask: string): string[][] {
  if (!mask) {
    return [['_']];
  }
  return mask
    .trim()
    .split(/\s{2,}/)
    .map((word) => word.split(' ').filter((part) => part.length > 0))
    .filter((word) => word.length > 0);
}

function chunkWord(letters: string[], maxPerRow: number): HangmanMaskToken[][] {
  if (letters.length <= maxPerRow) {
    return [letters.map(tokenFromChar)];
  }

  const chunks: HangmanMaskToken[][] = [];
  let index = 0;
  while (index < letters.length) {
    const remaining = letters.length - index;
    const last = remaining <= maxPerRow;
    const take = last ? remaining : Math.max(1, maxPerRow - 1);
    const chunk = letters.slice(index, index + take).map(tokenFromChar);
    if (!last) {
      chunk.push({ kind: 'hyphen' });
    }
    chunks.push(chunk);
    index += take;
  }
  return chunks;
}

function rowSlots(row: HangmanMaskRow): number {
  if (row.length === 0) {
    return 0;
  }
  const letters = row.reduce((sum, word) => sum + word.length, 0);
  return letters + (row.length - 1);
}

/** Keep whole words together. Hyphenate only when a single word cannot fit. */
export function layoutHangmanMaskRows(
  mask: string,
  maxPerRow: number,
): HangmanMaskRow[] {
  const limit = Math.max(1, maxPerRow);
  const words = wordsFromHangmanMask(mask);
  const rows: HangmanMaskRow[] = [];
  let current: HangmanMaskRow = [];

  const flush = () => {
    if (current.length > 0) {
      rows.push(current);
      current = [];
    }
  };

  for (const word of words) {
    if (word.length > limit) {
      flush();
      for (const chunk of chunkWord(word, limit)) {
        rows.push([chunk]);
      }
      continue;
    }

    const tokens = word.map(tokenFromChar);
    const gap = current.length > 0 ? 1 : 0;
    if (rowSlots(current) + gap + tokens.length > limit) {
      flush();
    }
    current.push(tokens);
  }

  flush();
  return rows.length > 0 ? rows : [[[{ kind: 'blank' }]]];
}
