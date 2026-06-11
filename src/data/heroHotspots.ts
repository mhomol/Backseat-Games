/**
 * Normalized tap targets on illustrated signs (measured from hero WebP art).
 * Home/host signs sit at ~60.7%, 67.1%, and 74.2% from the top (~75px tall each).
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
    left: 0.01,
    top: 0.607,
    width: 0.58,
    height: 0.048,
  },
  {
    id: 'sign-game',
    label: 'Sign Game',
    left: 0.01,
    top: 0.671,
    width: 0.55,
    height: 0.049,
  },
  {
    id: 'bingo',
    label: 'Travel Bingo',
    left: 0.01,
    top: 0.742,
    width: 0.58,
    height: 0.045,
  },
];
