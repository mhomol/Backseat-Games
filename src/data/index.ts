import platesData from './plates.json';
import bingoItemsData from './bingo-items.json';
import type { BingoItem, GameType, Plate } from '../types/game';

export const plates: Plate[] = platesData as Plate[];
export const bingoItems: BingoItem[] = bingoItemsData as BingoItem[];

export const plateByCode = Object.fromEntries(
  plates.map((plate) => [plate.code, plate]),
) as Record<string, Plate>;

export const bingoItemById = Object.fromEntries(
  bingoItems.map((item) => [item.id, item]),
) as Record<string, BingoItem>;

export const GAME_LABELS: Record<GameType, string> = {
  'license-plates': 'License Plate Game',
  bingo: 'Travel Bingo',
  'sign-game': 'Sign Game',
  hangman: 'Hangman',
  'color-catch': 'Color Catch',
};

export const GAME_DESCRIPTIONS: Record<GameType, string> = {
  'license-plates': 'Spot state and province plates. First to claim wins the point!',
  bingo: 'Mark things you see on your unique bingo card. First bingo wins!',
  'sign-game': 'Race from A to Z using road signs. Type or say your words!',
  hangman: 'Guess the word or phrase before the hangman is complete.',
  'color-catch': 'Mark vehicle colors on your unique card. First bingo wins!',
};

export const GAME_EMOJI: Record<GameType, string> = {
  'license-plates': '🚗',
  bingo: '🎯',
  'sign-game': '🔤',
  hangman: '🪢',
  'color-catch': '🎨',
};
