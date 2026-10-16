import type { ImageSourcePropType } from 'react-native';
import { sceneryImages, type SceneryVariant } from './brandAssets';
import { gameSceneryRotation, type GameSceneryEntry } from './gameSceneryRotation';
import type { HangmanCharacter, ThemeAmbient, ThemeId } from '../types/theme';
import type { PaidThemeId } from '../types/theme';
import {
  CHRISTMAS_THEME_PRODUCT_ID,
  THANKSGIVING_THEME_PRODUCT_ID,
} from '../types/purchases';
import holidayBingo from './bingo-holiday-items.json';
import type { BingoItem } from '../types/game';

export type HeroArt = {
  source: ImageSourcePropType;
  /** Top-of-this-file average. Letterbox + stack header when this hero is showing. */
  sky: string;
};

export type ThemePack = {
  id: ThemeId;
  name: string;
  productId: string | null;
  /** Fallback chrome (loading shells). Prefer the home-hero sample. */
  sky: string;
  ambient: ThemeAmbient;
  hangmanCharacter: HangmanCharacter;
  freeCenterLabel: string;
  extraBingoItems: BingoItem[];
  /** Empty = use classic game scenery rotation until holiday art is promoted. */
  scenery: GameSceneryEntry[];
  heroes: Record<SceneryVariant, HeroArt>;
};

const thanksgivingExtras = holidayBingo.thanksgiving as BingoItem[];
const christmasExtras = holidayBingo.christmas as BingoItem[];

const classicHeroes: Record<SceneryVariant, HeroArt> = {
  home: { source: sceneryImages.home, sky: '#59B9E1' },
  host: { source: sceneryImages.host, sky: '#5ABAE2' },
  join: { source: sceneryImages.join, sky: '#5BB9E2' },
  lobby: { source: sceneryImages.lobby, sky: '#5BB9E2' },
};

const thanksgivingWaiting = require('../../assets/branding/themes/thanksgiving/waiting-hero.webp');
const thanksgivingLighthouse = require('../../assets/branding/themes/thanksgiving/thanksgiving-lighthouse.webp');
const thanksgivingSmallTown = require('../../assets/branding/themes/thanksgiving/thanksgiving-small-town.webp');
const thanksgivingCornfield = require('../../assets/branding/themes/thanksgiving/thanksgiving-cornfield.webp');
const thanksgivingSunflowers = require('../../assets/branding/themes/thanksgiving/thanksgiving-sunflowers.webp');
const christmasWaiting = require('../../assets/branding/themes/christmas/waiting-hero.webp');
const christmasSanta = require('../../assets/branding/themes/christmas/christmas-santa.webp');
const christmasSnowman = require('../../assets/branding/themes/christmas/christmas-snowman.webp');
const christmasTree = require('../../assets/branding/themes/christmas/christmas-tree.webp');
const christmasDowntown = require('../../assets/branding/themes/christmas/christmas-downtown.webp');

const thanksgivingHome = require('../../assets/branding/themes/thanksgiving/home-hero.webp');
const thanksgivingHost = require('../../assets/branding/themes/thanksgiving/host-hero.webp');
const christmasHome = require('../../assets/branding/themes/christmas/home-hero.webp');
const christmasHost = require('../../assets/branding/themes/christmas/host-hero.webp');

const thanksgivingHeroes: Record<SceneryVariant, HeroArt> = {
  home: { source: thanksgivingHome, sky: '#FD9C45' },
  host: { source: thanksgivingHost, sky: '#F67E20' },
  join: { source: thanksgivingWaiting, sky: '#FA9B41' },
  lobby: { source: thanksgivingWaiting, sky: '#FA9B41' },
};

const christmasHeroes: Record<SceneryVariant, HeroArt> = {
  home: { source: christmasHome, sky: '#1D2941' },
  host: { source: christmasHost, sky: '#212237' },
  join: { source: christmasWaiting, sky: '#18273F' },
  lobby: { source: christmasWaiting, sky: '#18273F' },
};

export const themePacks: Record<ThemeId, ThemePack> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    productId: null,
    sky: '#59B9E1',
    ambient: 'classic',
    hangmanCharacter: 'hitchhiker',
    freeCenterLabel: 'Road Trip!',
    extraBingoItems: [],
    scenery: gameSceneryRotation,
    heroes: classicHeroes,
  },
  thanksgiving: {
    id: 'thanksgiving',
    name: 'Thanksgiving',
    productId: THANKSGIVING_THEME_PRODUCT_ID,
    sky: '#FD9C45',
    ambient: 'leaves',
    hangmanCharacter: 'pilgrim',
    freeCenterLabel: 'Turkey Trot!',
    extraBingoItems: thanksgivingExtras,
    scenery: [
      {
        id: 'thanksgiving-waiting',
        label: 'Thanksgiving pumpkin road',
        source: thanksgivingWaiting,
        sky: '#FA9B41',
      },
      {
        id: 'thanksgiving-lighthouse',
        label: 'Thanksgiving lighthouse causeway',
        source: thanksgivingLighthouse,
        sky: '#F59D43',
      },
      {
        id: 'thanksgiving-small-town',
        label: 'Thanksgiving small town',
        source: thanksgivingSmallTown,
        sky: '#F69E44',
      },
      {
        id: 'thanksgiving-cornfield',
        label: 'Thanksgiving cornfield',
        source: thanksgivingCornfield,
        sky: '#FBA243',
      },
      {
        id: 'thanksgiving-sunflowers',
        label: 'Thanksgiving sunflower road',
        source: thanksgivingSunflowers,
        sky: '#F79F42',
      },
    ],
    heroes: thanksgivingHeroes,
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    productId: CHRISTMAS_THEME_PRODUCT_ID,
    sky: '#1D2941',
    ambient: 'snow',
    hangmanCharacter: 'santa',
    freeCenterLabel: 'Holiday Ride!',
    extraBingoItems: christmasExtras,
    scenery: [
      {
        id: 'christmas-waiting',
        label: 'Christmas snow road',
        source: christmasWaiting,
        sky: '#18273F',
      },
      {
        id: 'christmas-santa',
        label: 'Christmas Santa sleigh',
        source: christmasSanta,
        sky: '#1F2F49',
      },
      {
        id: 'christmas-snowman',
        label: 'Christmas cottage snowman',
        source: christmasSnowman,
        sky: '#1A2A42',
      },
      {
        id: 'christmas-tree',
        label: 'Christmas town tree',
        source: christmasTree,
        sky: '#1A2942',
      },
      {
        id: 'christmas-downtown',
        label: 'Christmas downtown',
        source: christmasDowntown,
        sky: '#1A2A42',
      },
    ],
    heroes: christmasHeroes,
  },
};

export const PAID_THEME_PACKS: ThemePack[] = [themePacks.thanksgiving, themePacks.christmas];

export function getThemePack(themeId: ThemeId): ThemePack {
  return themePacks[themeId];
}

export function paidThemeIdFromPack(pack: ThemePack): PaidThemeId | null {
  return pack.id === 'classic' ? null : pack.id;
}

export function heroSourceForTheme(
  themeId: ThemeId,
  variant: SceneryVariant,
): ImageSourcePropType {
  return getThemePack(themeId).heroes[variant].source;
}

/** Sky bleed for whatever illustration is actually on screen. */
export function skyForDisplayedArt(
  pack: ThemePack,
  variant: SceneryVariant,
  scenerySource?: ImageSourcePropType,
): string {
  if (scenerySource) {
    const fromPack = pack.scenery.find((entry) => entry.source === scenerySource);
    if (fromPack) {
      return fromPack.sky;
    }
    const fromClassic = gameSceneryRotation.find((entry) => entry.source === scenerySource);
    if (fromClassic) {
      return fromClassic.sky;
    }
  }
  return pack.heroes[variant].sky;
}

export function sceneryRotationForTheme(themeId: ThemeId): GameSceneryEntry[] {
  const pack = getThemePack(themeId);
  return pack.scenery.length > 0 ? pack.scenery : gameSceneryRotation;
}
