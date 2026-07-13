import { bingoItems } from '../data';
import type {
  ApplyResult,
  BingoCard,
  BingoState,
  GameAction,
  SessionState,
} from '../types/game';

const BINGO_SIZE = 25;
const FREE_CENTER_INDEX = 12;

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

export function generateBingoCard(sessionId: string, playerId: string): BingoCard {
  const shuffled = seededShuffle(
    bingoItems.map((item) => item.id),
    `${sessionId}:${playerId}`,
  );
  const itemIds = shuffled.slice(0, 24);
  return { itemIds, freeCenter: true };
}

export function createBingoState(session: SessionState): BingoState {
  const cards: Record<string, BingoCard> = {};
  const marked: Record<string, boolean[]> = {};

  for (const player of session.players) {
    cards[player.id] = generateBingoCard(session.sessionId, player.id);
    marked[player.id] = Array(BINGO_SIZE).fill(false);
    marked[player.id][FREE_CENTER_INDEX] = true;
  }

  return { type: 'bingo', cards, marked, winnerId: null };
}

function getMarkedIndices(marked: boolean[]): number[] {
  return marked
    .map((value, index) => (value ? index : -1))
    .filter((index) => index >= 0);
}

function hasLineBingo(marked: boolean[]): boolean {
  const lines = [
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20],
  ];

  return lines.some((line) => line.every((index) => marked[index]));
}

function hasBlackout(marked: boolean[]): boolean {
  return marked.every(Boolean);
}

function hasBingoWin(marked: boolean[], winMode: 'line' | 'blackout'): boolean {
  if (winMode === 'blackout') {
    return hasBlackout(marked);
  }
  return hasLineBingo(marked);
}

/** Preview whether marking `index` would complete a bingo for the given win mode. */
export function wouldCompleteBingo(
  marked: boolean[],
  index: number,
  winMode: 'line' | 'blackout',
): boolean {
  if (index < 0 || index >= BINGO_SIZE || marked[index]) {
    return false;
  }
  const next = [...marked];
  next[index] = true;
  return hasBingoWin(next, winMode);
}

export function applyBingoAction(
  session: SessionState,
  playerId: string,
  action: GameAction,
): ApplyResult {
  if (session.gameState?.type !== 'bingo') {
    return { ok: false, reason: 'Wrong game type.' };
  }

  const state = session.gameState;
  if (state.winnerId) {
    return { ok: false, reason: 'Game already has a winner.' };
  }

  const playerMarked = state.marked[playerId];
  if (!playerMarked) {
    return { ok: false, reason: 'No bingo card found.' };
  }

  if (action.type === 'MARK_BINGO') {
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
    const winnerId = hasBingoWin(nextMarked, session.gameRules.bingo.winMode)
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

  if (action.type === 'UNMARK_BINGO') {
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

  return { ok: false, reason: 'Invalid action for Travel Bingo.' };
}

export function getBingoSquareLabel(
  card: BingoCard,
  index: number,
): { id?: string; label: string; icon: string; category?: string } {
  if (index === FREE_CENTER_INDEX) {
    return { label: 'Road Trip!', icon: '🚗', category: 'vehicles' };
  }
  const itemIndex = index < FREE_CENTER_INDEX ? index : index - 1;
  const itemId = card.itemIds[itemIndex];
  const item = bingoItems.find((entry) => entry.id === itemId);
  return {
    id: item?.id,
    label: item?.label ?? '???',
    icon: item?.icon ?? '❓',
    category: item?.category,
  };
}

export { BINGO_SIZE, FREE_CENTER_INDEX, getMarkedIndices, hasBlackout, hasLineBingo };
