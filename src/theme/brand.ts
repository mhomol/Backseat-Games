import type { GameType } from '../types/game';

/** Core palette sampled from Grace's Backseat Games icon art. */
export const brand = {
  pink: '#F25B88',
  pinkDark: '#D94874',
  pinkLight: '#FF8CB0',
  green: '#3BCA6E',
  greenDark: '#2BA85A',
  greenLight: '#6DDB93',
  blue: '#3FA9F5',
  blueDark: '#2B8FD9',
  blueLight: '#6FC0FA',
  sky: '#7EC8F7',
  ocean: '#2E86C8',
  road: '#4A4F58',
  cream: '#FFF8EE',
  wood: '#8B5E3C',
} as const;

export const gameBrandColors: Record<
  GameType,
  { primary: string; dark: string; label: string }
> = {
  'license-plates': {
    primary: brand.pink,
    dark: brand.pinkDark,
    label: 'License Plate Game',
  },
  'sign-game': {
    primary: brand.green,
    dark: brand.greenDark,
    label: 'Sign Game',
  },
  bingo: {
    primary: brand.blue,
    dark: brand.blueDark,
    label: 'Travel Bingo',
  },
};

export type SignPostColor = 'pink' | 'green' | 'blue';

export const signPostColors: Record<
  SignPostColor,
  { fill: string; border: string; text: string }
> = {
  pink: { fill: brand.pink, border: brand.pinkDark, text: '#FFFFFF' },
  green: { fill: brand.green, border: brand.greenDark, text: '#FFFFFF' },
  blue: { fill: brand.blue, border: brand.blueDark, text: '#FFFFFF' },
};
