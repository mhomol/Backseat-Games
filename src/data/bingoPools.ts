import holidayBingo from './bingo-holiday-items.json';
import { bingoItems } from './index';
import type { BingoItem } from '../types/game';
import type { ThemeId } from '../types/theme';
import { isThemeId } from '../types/theme';

const extrasByTheme: Record<Exclude<ThemeId, 'classic'>, BingoItem[]> = {
  halloween: holidayBingo.halloween as BingoItem[],
  thanksgiving: holidayBingo.thanksgiving as BingoItem[],
  christmas: holidayBingo.christmas as BingoItem[],
};

const extraById: Record<string, BingoItem> = Object.fromEntries(
  [
    ...extrasByTheme.halloween,
    ...extrasByTheme.thanksgiving,
    ...extrasByTheme.christmas,
  ].map((item) => [item.id, item]),
);

export const FREE_CENTER_LABEL: Record<ThemeId, string> = {
  classic: 'Road Trip!',
  halloween: 'Trick or Trip!',
  thanksgiving: 'Turkey Trot!',
  christmas: 'Holiday Ride!',
};

export function holidayBingoItems(themeId: ThemeId): BingoItem[] {
  if (themeId === 'classic') {
    return [];
  }
  return extrasByTheme[themeId];
}

export function bingoPoolIds(themeId: ThemeId): string[] {
  return [...bingoItems.map((item) => item.id), ...holidayBingoItems(themeId).map((item) => item.id)];
}

export function findBingoItem(itemId: string | undefined): BingoItem | undefined {
  if (!itemId) {
    return undefined;
  }
  return bingoItems.find((item) => item.id === itemId) ?? extraById[itemId];
}

export function themeIdFromSession(themeId: unknown): ThemeId {
  return typeof themeId === 'string' && isThemeId(themeId) ? themeId : 'classic';
}
