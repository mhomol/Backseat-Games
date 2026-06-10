/** Normalized tap targets aligned to signs in 768×1344 hero art. */
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
    top: 0.378,
    width: 0.47,
    height: 0.052,
  },
  {
    id: 'join',
    label: 'Join a Game',
    left: 0.01,
    top: 0.432,
    width: 0.47,
    height: 0.052,
  },
  {
    id: 'settings',
    label: 'Settings',
    left: 0.01,
    top: 0.486,
    width: 0.5,
    height: 0.052,
  },
];

export const hostHeroHotspots: HeroHotspot[] = [
  {
    id: 'license-plates',
    label: 'License Plates',
    left: 0.01,
    top: 0.378,
    width: 0.5,
    height: 0.052,
  },
  {
    id: 'sign-game',
    label: 'Sign Game',
    left: 0.01,
    top: 0.432,
    width: 0.47,
    height: 0.052,
  },
  {
    id: 'bingo',
    label: 'Travel Bingo',
    left: 0.01,
    top: 0.486,
    width: 0.52,
    height: 0.052,
  },
];
