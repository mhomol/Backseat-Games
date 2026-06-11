/** Normalized tap targets aligned to sign art in tall portrait heroes. */
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
    top: 0.44,
    width: 0.52,
    height: 0.048,
  },
  {
    id: 'join',
    label: 'Join a Game',
    left: 0.01,
    top: 0.49,
    width: 0.52,
    height: 0.048,
  },
  {
    id: 'settings',
    label: 'Settings',
    left: 0.01,
    top: 0.54,
    width: 0.5,
    height: 0.048,
  },
];

export const hostHeroHotspots: HeroHotspot[] = [
  {
    id: 'license-plates',
    label: 'License Plates',
    left: 0.01,
    top: 0.44,
    width: 0.58,
    height: 0.048,
  },
  {
    id: 'sign-game',
    label: 'Sign Game',
    left: 0.01,
    top: 0.49,
    width: 0.52,
    height: 0.048,
  },
  {
    id: 'bingo',
    label: 'Travel Bingo',
    left: 0.01,
    top: 0.54,
    width: 0.58,
    height: 0.048,
  },
];
