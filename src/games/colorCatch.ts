import { vehicleColorById, vehicleColors } from '../data/vehicleColors';
import type {
  ApplyResult,
  BingoCard,
  ColorCatchState,
  GameAction,
  SessionState,
} from '../types/game';
import type { ColorCatchDifficulty } from '../types/preferences';
import { hasBlackout } from './bingo';

export const COLOR_CATCH_EASY_SIZE = 3;
export const COLOR_CATCH_HARD_SIZE = 5;

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const copy = [...items];
  let state = hashSeed(seed) || 1;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    const j = state % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function colorCatchGridSize(difficulty: ColorCatchDifficulty | undefined): 3 | 5 {
  return difficulty === 'easy' ? COLOR_CATCH_EASY_SIZE : COLOR_CATCH_HARD_SIZE;
}

export function colorCatchCellCount(gridSize: number): number {
  return gridSize * gridSize;
}

export function colorCatchFreeCenterIndex(gridSize: number): number {
  return Math.floor((gridSize * gridSize) / 2);
}

export function colorCatchFilledCount(gridSize: number): number {
  return colorCatchCellCount(gridSize) - 1;
}

function hasColorCatchLine(marked: boolean[], gridSize: number): boolean {
  for (let row = 0; row < gridSize; row += 1) {
    if ([...Array(gridSize)].every((_, col) => marked[row * gridSize + col])) {
      return true;
    }
  }
  for (let col = 0; col < gridSize; col += 1) {
    if ([...Array(gridSize)].every((_, row) => marked[row * gridSize + col])) {
      return true;
    }
  }
  if ([...Array(gridSize)].every((_, index) => marked[index * gridSize + index])) {
    return true;
  }
  if (
    [...Array(gridSize)].every((_, index) => marked[index * gridSize + (gridSize - 1 - index)])
  ) {
    return true;
  }
  return false;
}

export function generateColorCatchCard(
  sessionId: string,
  playerId: string,
  gridSize: number,
  shuffleSalt: string,
): BingoCard {
  const shuffled = seededShuffle(
    vehicleColors.map((color) => color.id),
    `${sessionId}:color-catch:${playerId}:${shuffleSalt}`,
  );
  return { itemIds: shuffled.slice(0, colorCatchFilledCount(gridSize)), freeCenter: true };
}

export function createColorCatchState(session: SessionState): ColorCatchState {
  const difficulty: ColorCatchDifficulty = session.gameRules['color-catch'].difficulty ?? 'hard';
  const gridSize = colorCatchGridSize(difficulty);
  const cellCount = colorCatchCellCount(gridSize);
  const freeCenter = colorCatchFreeCenterIndex(gridSize);
  const shuffleSalt = Math.random().toString(36).slice(2);
  const cards: Record<string, BingoCard> = {};
  const marked: Record<string, boolean[]> = {};

  for (const player of session.players) {
    cards[player.id] = generateColorCatchCard(
      session.sessionId,
      player.id,
      gridSize,
      shuffleSalt,
    );
    marked[player.id] = Array(cellCount).fill(false);
    marked[player.id][freeCenter] = true;
  }

  return { type: 'color-catch', gridSize, difficulty, cards, marked, winnerId: null };
}

function hasColorCatchWin(marked: boolean[], winMode: 'line' | 'blackout', gridSize: number): boolean {
  if (winMode === 'blackout') {
    return hasBlackout(marked);
  }
  return hasColorCatchLine(marked, gridSize);
}

export function wouldCompleteColorCatch(
  marked: boolean[],
  index: number,
  winMode: 'line' | 'blackout',
  gridSize: number,
): boolean {
  const cellCount = colorCatchCellCount(gridSize);
  if (index < 0 || index >= cellCount || marked[index]) {
    return false;
  }
  const next = [...marked];
  next[index] = true;
  return hasColorCatchWin(next, winMode, gridSize);
}

export function applyColorCatchAction(
  session: SessionState,
  playerId: string,
  action: GameAction,
): ApplyResult {
  if (session.gameState?.type !== 'color-catch') {
    return { ok: false, reason: 'Wrong game type.' };
  }

  const state = session.gameState;
  if (state.winnerId) {
    return { ok: false, reason: 'Game already has a winner.' };
  }

  const playerMarked = state.marked[playerId];
  if (!playerMarked) {
    return { ok: false, reason: 'No color card found.' };
  }

  const gridSize = state.gridSize;
  const cellCount = colorCatchCellCount(gridSize);
  const freeCenter = colorCatchFreeCenterIndex(gridSize);

  if (action.type === 'MARK_COLOR_CATCH') {
    if (action.index < 0 || action.index >= cellCount) {
      return { ok: false, reason: 'Invalid square.' };
    }
    if (action.index === freeCenter) {
      return { ok: false, reason: 'Free space is always marked.' };
    }
    if (playerMarked[action.index]) {
      return { ok: false, reason: 'Square already marked.' };
    }
    const nextMarked = [...playerMarked];
    nextMarked[action.index] = true;
    const winnerId = hasColorCatchWin(
      nextMarked,
      session.gameRules['color-catch'].winMode,
      gridSize,
    )
      ? playerId
      : null;
    return {
      ok: true,
      state: {
        ...session,
        phase: winnerId ? 'finished' : session.phase,
        winnerId,
        lastRejection: null,
        gameState: {
          ...state,
          marked: { ...state.marked, [playerId]: nextMarked },
          winnerId,
        },
      },
    };
  }

  if (action.type === 'UNMARK_COLOR_CATCH') {
    if (action.index === freeCenter) {
      return { ok: false, reason: 'Free space cannot be unmarked.' };
    }
    if (!playerMarked[action.index]) {
      return { ok: false, reason: 'Square is not marked.' };
    }
    const nextMarked = [...playerMarked];
    nextMarked[action.index] = false;
    return {
      ok: true,
      state: {
        ...session,
        lastRejection: null,
        gameState: {
          ...state,
          marked: { ...state.marked, [playerId]: nextMarked },
          winnerId: null,
        },
      },
    };
  }

  return { ok: false, reason: 'Invalid action for Color Catch.' };
}

export function getColorCatchSquare(
  card: BingoCard,
  index: number,
  gridSize: number,
): { id?: string; label: string; hex: string } {
  const freeCenter = colorCatchFreeCenterIndex(gridSize);
  if (index === freeCenter) {
    return { label: 'Free', hex: '#FFF8E8' };
  }
  const itemIndex = index < freeCenter ? index : index - 1;
  const colorId = card.itemIds[itemIndex];
  const color = vehicleColorById[colorId];
  return {
    id: color?.id,
    label: color?.label ?? '???',
    hex: color?.hex ?? '#CCCCCC',
  };
}

export function getColorCatchMarkCount(state: ColorCatchState, playerId: string): number {
  return state.marked[playerId]?.filter(Boolean).length ?? 0;
}
