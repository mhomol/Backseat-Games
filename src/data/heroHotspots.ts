/**
 * Normalized tap targets on illustrated signs (measured from hero WebP art).
 * Home signs sit at ~60.7%, 67.1%, and 74.2% from the top (~75px tall each).
 * Host five-sign stack: ~60.6%, 67.1%, 74.0%, 79.9%, 86.0%.
 */
export type HeroHotspot = {
  id: string;
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export const homeHeroHotspots: HeroHotspot[] = [
  {
    id: 'start',
    label: 'Start a Game',
    left: 0.01,
    top: 0.607,
    width: 0.55,
    height: 0.049,
  },
  {
    id: 'join',
    label: 'Join a Game',
    left: 0.01,
    top: 0.671,
    width: 0.55,
    height: 0.049,
  },
  {
    id: 'settings',
    label: 'Settings',
    left: 0.01,
    top: 0.742,
    width: 0.55,
    height: 0.046,
  },
];

export const hostHeroHotspots: HeroHotspot[] = [
  {
    id: 'license-plates',
    label: 'License Plates',
    left: 0.0,
    top: 0.606,
    width: 0.5,
    height: 0.05,
  },
  {
    id: 'sign-game',
    label: 'Sign Game',
    left: 0.0,
    top: 0.671,
    width: 0.5,
    height: 0.05,
  },
  {
    id: 'bingo',
    label: 'Travel Bingo',
    left: 0.0,
    top: 0.74,
    width: 0.5,
    height: 0.05,
  },
  {
    id: 'hangman',
    label: 'Hangman',
    left: 0.0,
    top: 0.799,
    width: 0.5,
    height: 0.046,
  },
  {
    id: 'color-catch',
    label: 'Color Catch',
    left: 0.0,
    top: 0.86,
    width: 0.5,
    height: 0.044,
  },
];
