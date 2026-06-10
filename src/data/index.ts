import platesData from './plates.json';
import bingoItemsData from './bingo-items.json';
import type { BingoItem, Plate } from '../types/game';

export const plates: Plate[] = platesData as Plate[];
export const bingoItems: BingoItem[] = bingoItemsData as BingoItem[];

export const plateByCode = Object.fromEntries(
  plates.map((plate) => [plate.code, plate]),
) as Record<string, Plate>;

export const bingoItemById = Object.fromEntries(
  bingoItems.map((item) => [item.id, item]),
) as Record<string, BingoItem>;

export const GAME_LABELS = {
  'license-plates': 'License Plate Game',
  bingo: 'Travel Bingo',
  'sign-game': 'Sign Game',
} as const;

export const GAME_DESCRIPTIONS = {
  'license-plates': 'Spot state and province plates. First to claim wins the point!',
  bingo: 'Mark things you see on your unique bingo card. First bingo wins!',
  'sign-game': 'Race from A to Z using road signs. Call out words with audio!',
} as const;

export const GAME_EMOJI = {
  'license-plates': '🚗',
  bingo: '🎯',
  'sign-game': '🔤',
} as const;
