import type { ImageSourcePropType } from 'react-native';

export type SceneryVariant = 'home' | 'host' | 'join' | 'lobby';

export const heroDimensions: Record<SceneryVariant, { width: number; height: number }> = {
  home: { width: 768, height: 1536 },
  host: { width: 720, height: 1456 },
  join: { width: 720, height: 1456 },
  lobby: { width: 720, height: 1456 },
};

export const sceneryImages: Record<SceneryVariant, ImageSourcePropType> = {
  home: require('../../assets/branding/home-hero.webp'),
  host: require('../../assets/branding/host-hero.webp'),
  join: require('../../assets/branding/waiting-hero.webp'),
  lobby: require('../../assets/branding/waiting-hero.webp'),
};

/** Standalone marketing logo — same Recraft V4 style as hero art */
export const logoLockup = require('../../assets/branding/logo-lockup.webp');

export const appIconSource = require('../../assets/icon.png');

export function heroAspectRatio(variant: SceneryVariant): number {
  const { width, height } = heroDimensions[variant];
  return width / height;
}
