import type { ImageSourcePropType } from 'react-native';

/** Portrait hero size shared by waiting room + in-game scenery rotation. */
export const GAME_SCENERY_WIDTH = 720;
export const GAME_SCENERY_HEIGHT = 1456;
export const GAME_SCENERY_ASPECT = GAME_SCENERY_WIDTH / GAME_SCENERY_HEIGHT;

export type GameSceneryEntry = {
  id: string;
  label: string;
  source: ImageSourcePropType;
};

/**
 * Randomized backgrounds for game waiting rooms and active gameplay.
 * Add new art under assets/branding/game-scenery/, then append here and ROTATION.md.
 */
export const gameSceneryRotation: GameSceneryEntry[] = [
  {
    id: 'rolling-hills',
    label: 'Rolling hills (original waiting room)',
    source: require('../../assets/branding/waiting-hero.webp'),
  },
  {
    id: 'countryside-blue-sky',
    label: 'Countryside & open road',
    source: require('../../assets/branding/game-scenery/countryside-blue-sky.webp'),
  },
  {
    id: 'canyon-blue-sky',
    label: 'Desert canyon',
    source: require('../../assets/branding/game-scenery/canyon-blue-sky.webp'),
  },
  {
    id: 'snowy-moose-blue-sky',
    label: 'Snowy mountains & moose',
    source: require('../../assets/branding/game-scenery/snowy-moose-blue-sky.webp'),
  },
  {
    id: 'serengeti-blue-sky',
    label: 'Serengeti safari',
    source: require('../../assets/branding/game-scenery/serengeti-blue-sky.webp'),
  },
  {
    id: 'city-blue-sky',
    label: 'City street',
    source: require('../../assets/branding/game-scenery/city-blue-sky.webp'),
  },
  {
    id: 'golden-gate-blue-sky',
    label: 'Golden Gate bridge',
    source: require('../../assets/branding/game-scenery/golden-gate-blue-sky.webp'),
  },
];

export function sceneryIndexForSession(
  sessionId: string,
  rotation: readonly GameSceneryEntry[] = gameSceneryRotation,
): number {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i += 1) {
    hash = (hash * 31 + sessionId.charCodeAt(i)) >>> 0;
  }
  const length = rotation.length || 1;
  return hash % length;
}

export function gameSceneryForSession(
  sessionId: string,
  rotation: readonly GameSceneryEntry[] = gameSceneryRotation,
): GameSceneryEntry {
  const list = rotation.length > 0 ? rotation : gameSceneryRotation;
  return list[sceneryIndexForSession(sessionId, list)]!;
}
