import type { HangmanCharacter } from '@/types/theme';

/**
 * Shared gallows + head lock. Body parts are offsets from the head's top-left
 * so a locked look re-renders the same way. Compose previews are 512×684
 * against this 132×176 frame (~3.88 preview px per layout px).
 */
export const HANGMAN_FRAME = { width: 132, height: 176 } as const;
export const HANGMAN_PREVIEW = { width: 512, height: 684 } as const;

export const HANGMAN_HEAD = {
  left: 58,
  top: 18,
  width: 44,
  height: 40,
} as const;

export function previewPx(n: number): number {
  return (n * HANGMAN_FRAME.width) / HANGMAN_PREVIEW.width;
}

export type HangmanBodyPart = {
  /** Offset from HANGMAN_HEAD.left / .top */
  dx: number;
  dy: number;
  width: number;
  height: number;
  zIndex: number;
  flipX?: boolean;
  /** Sleeve art that is drawn hand-up needs this so the cream tip hangs down. */
  flipY?: boolean;
  rotate?: `${number}deg`;
  origin?: 'left top' | 'right top';
  /** Apply flipX on the inner image so rotate origin stays on the wrap. */
  flipOnImage?: boolean;
};

export type HangmanFigureLayout = {
  /** Defaults to HANGMAN_HEAD (dx/dy 0, lock size). */
  head?: HangmanBodyPart;
  torso: HangmanBodyPart;
  armLeft: HangmanBodyPart;
  armRight: HangmanBodyPart;
  legLeft: HangmanBodyPart;
  legRight: HangmanBodyPart;
};

const hitchhikerLayout: HangmanFigureLayout = {
  torso: { dx: 5, dy: 37, width: 34, height: 54, zIndex: 3 },
  armLeft: { dx: -18.5, dy: 46, width: 32, height: 42, zIndex: 1, flipX: true },
  armRight: { dx: 29, dy: 45, width: 32, height: 42, zIndex: 1 },
  legLeft: {
    dx: -25.6,
    dy: 80,
    width: 42,
    height: 48,
    zIndex: 4,
    flipX: true,
    flipOnImage: true,
    rotate: '-4deg',
    origin: 'left top',
  },
  legRight: {
    dx: 29,
    dy: 79,
    width: 42,
    height: 48,
    zIndex: 4,
    rotate: '4deg',
    origin: 'right top',
  },
};

const skeletonLayout: HangmanFigureLayout = {
  ...hitchhikerLayout,
  torso: { dx: 2.4 + previewPx(2), dy: 37, width: 34, height: 54, zIndex: 1 },
  armLeft: {
    dx: -18.5 - previewPx(20),
    dy: 46 - previewPx(15),
    width: 32,
    height: 42,
    zIndex: 2,
    flipX: true,
  },
  armRight: {
    dx: 29 + previewPx(15),
    dy: 45 - previewPx(10),
    width: 32,
    height: 42,
    zIndex: 2,
  },
  legLeft: {
    ...hitchhikerLayout.legLeft,
    dx: -25.6 + previewPx(23),
    dy: 80 - previewPx(4),
  },
  legRight: {
    ...hitchhikerLayout.legRight,
    dx: 29 - previewPx(8),
    dy: 79 - previewPx(3),
  },
};

/** Starts on the classic grid; Thanksgiving nudges go here. */
const pilgrimLayout: HangmanFigureLayout = {
  ...hitchhikerLayout,
  head: { dx: -6, dy: -22 + previewPx(55), width: 56, height: 64, zIndex: 5 },
  torso: { dx: 3, dy: 38, width: 38, height: 56, zIndex: 3 },
  armLeft: {
    dx: -18.5,
    dy: 46,
    width: 32,
    height: 42,
    zIndex: 1,
    flipX: true,
    flipY: true,
  },
  armRight: {
    dx: 29,
    dy: 45,
    width: 32,
    height: 42,
    zIndex: 1,
    flipY: true,
  },
  legLeft: {
    ...hitchhikerLayout.legLeft,
    dy: 80 - previewPx(5),
  },
  legRight: {
    ...hitchhikerLayout.legRight,
    dy: 79 - previewPx(4),
  },
};

/** Locked to drafts/hangman-snowman-compose-preview.png. Legs are the two halves of the bottom ball. */
const snowmanLayout: HangmanFigureLayout = {
  // v7 visual ~36px; same center X as the 68.4 slot, sat on the torso under the beam.
  head: { dx: 4, dy: 4, width: 36, height: 36, zIndex: 5 },
  torso: { dx: -0.275, dy: 36.15, width: 44.55, height: 44.55, zIndex: 3 },
  armLeft: {
    dx: -19,
    dy: 48 - previewPx(70),
    width: 24,
    height: 20,
    zIndex: 4,
    flipX: true,
  },
  armRight: {
    dx: 39,
    dy: 48 - previewPx(70),
    width: 24,
    height: 20,
    zIndex: 4,
  },
  legLeft: { dx: -10, dy: 70, width: 40, height: 44, zIndex: 1 },
  legRight: { dx: 14, dy: 70, width: 40, height: 44, zIndex: 1, flipX: true },
};

const LAYOUTS: Partial<Record<HangmanCharacter, HangmanFigureLayout>> = {
  hitchhiker: hitchhikerLayout,
  skeleton: skeletonLayout,
  pilgrim: pilgrimLayout,
  snowman: snowmanLayout,
};

export function hangmanFigureLayout(
  character: HangmanCharacter,
): HangmanFigureLayout | null {
  return LAYOUTS[character] ?? null;
}

export function placeFromHead(part: HangmanBodyPart): { left: number; top: number } {
  return {
    left: HANGMAN_HEAD.left + part.dx,
    top: HANGMAN_HEAD.top + part.dy,
  };
}
