import type { ImageSourcePropType } from 'react-native';

export type SceneryVariant = 'home' | 'host' | 'join' | 'lobby';

export const sceneryImages: Record<SceneryVariant, ImageSourcePropType> = {
  home: require('../../assets/branding/home-hero.webp'),
  host: require('../../assets/branding/host-hero.webp'),
  join: require('../../assets/branding/join-hero.webp'),
  lobby: require('../../assets/branding/join-hero.webp'),
};

/** Standalone marketing logo — same Recraft V4 style as hero art */
export const logoLockup = require('../../assets/branding/logo-lockup.webp');

export const appIconSource = require('../../assets/icon.png');
