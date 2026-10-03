import { vehicleColorById, vehicleColors } from '../data/vehicleColors';
import type {
  ApplyResult,
  BingoCard,
  ColorCatchState,
  GameAction,
  SessionState,
} from '../types/game';
import {
  BINGO_SIZE,
  FREE_CENTER_INDEX,
  hasBlackout,
  hasLineBingo,
} from './bingo';

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

export function generateColorCatchCard(sessionId: string, playerId: string): BingoCard {
  const shuffled = seededShuffle(
    vehicleColors.map((color) => color.id),
    `${sessionId}:color-catch:${playerId}`,
  );
  return { itemIds: shuffled.slice(0, 24), freeCenter: true };
}

export function createColorCatchState(session: SessionState): ColorCatchState {
  const cards: Record<string, BingoCard> = {};
  const marked: Record<string, boolean[]> = {};

  for (const player of session.players) {
    cards[player.id] = generateColorCatchCard(session.sessionId, player.id);
    marked[player.id] = Array(BINGO_SIZE).fill(false);
    marked[player.id][FREE_CENTER_INDEX] = true;
  }

  return { type: 'color-catch', cards, marked, winnerId: null };
}

function hasColorCatchWin(marked: boolean[], winMode: 'line' | 'blackout'): boolean {
  if (winMode === 'blackout') {
    return hasBlackout(marked);
  }
  return hasLineBingo(marked);
}

export function wouldCompleteColorCatch(
  marked: boolean[],
  index: number,
  winMode: 'line' | 'blackout',
): boolean {
  if (index < 0 || index >= BINGO_SIZE || marked[index]) {
    return false;
  }
  const next = [...marked];
  next[index] = true;
  return hasColorCatchWin(next, winMode);
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

  if (action.type === 'MARK_COLOR_CATCH') {
    if (action.index < 0 || action.index >= BINGO_SIZE) {
      return { ok: false, reason: 'Invalid square.' };
    }
    if (action.index === FREE_CENTER_INDEX) {
      return { ok: false, reason: 'Free space is always marked.' };
    }
    if (playerMarked[action.index]) {
      return { ok: false, reason: 'Square already marked.' };
    }
    const nextMarked = [...playerMarked];
    nextMarked[action.index] = true;
    const winnerId = hasColorCatchWin(nextMarked, session.gameRules['color-catch'].winMode)
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
    if (action.index === FREE_CENTER_INDEX) {
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
): { id?: string; label: string; hex: string } {
  if (index === FREE_CENTER_INDEX) {
    return { label: 'Free!', hex: '#7CB342' };
  }
  const itemIndex = index < FREE_CENTER_INDEX ? index : index - 1;
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
