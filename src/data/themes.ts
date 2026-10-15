import type { ImageSourcePropType } from 'react-native';
import { sceneryImages, type SceneryVariant } from './brandAssets';
import { gameSceneryRotation, type GameSceneryEntry } from './gameSceneryRotation';
import { brand } from '../theme/brand';
import type { HangmanCharacter, ThemeAmbient, ThemeId } from '../types/theme';
import type { PaidThemeId } from '../types/theme';
import {
  CHRISTMAS_THEME_PRODUCT_ID,
  THANKSGIVING_THEME_PRODUCT_ID,
} from '../types/purchases';
import holidayBingo from './bingo-holiday-items.json';
import type { BingoItem } from '../types/game';

export type ThemePack = {
  id: ThemeId;
  name: string;
  productId: string | null;
  sky: string;
  ambient: ThemeAmbient;
  hangmanCharacter: HangmanCharacter;
  freeCenterLabel: string;
  extraBingoItems: BingoItem[];
  /** Empty = use classic game scenery rotation until holiday art is promoted. */
  scenery: GameSceneryEntry[];
  heroes: Record<SceneryVariant, ImageSourcePropType>;
};

const thanksgivingExtras = holidayBingo.thanksgiving as BingoItem[];
const christmasExtras = holidayBingo.christmas as BingoItem[];

const classicHeroes: Record<SceneryVariant, ImageSourcePropType> = {
  home: sceneryImages.home,
  host: sceneryImages.host,
  join: sceneryImages.join,
  lobby: sceneryImages.lobby,
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

const thanksgivingHeroes: Record<SceneryVariant, ImageSourcePropType> = {
  home: require('../../assets/branding/themes/thanksgiving/home-hero.webp'),
  host: require('../../assets/branding/themes/thanksgiving/host-hero.webp'),
  join: thanksgivingWaiting,
  lobby: thanksgivingWaiting,
};

const christmasHeroes: Record<SceneryVariant, ImageSourcePropType> = {
  home: require('../../assets/branding/themes/christmas/home-hero.webp'),
  host: require('../../assets/branding/themes/christmas/host-hero.webp'),
  join: christmasWaiting,
  lobby: christmasWaiting,
};

export const themePacks: Record<ThemeId, ThemePack> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    productId: null,
    sky: brand.sky,
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
    sky: '#FA9B40',
    ambient: 'leaves',
    hangmanCharacter: 'pilgrim',
    freeCenterLabel: 'Turkey Trot!',
    extraBingoItems: thanksgivingExtras,
    scenery: [
      {
        id: 'thanksgiving-waiting',
        label: 'Thanksgiving pumpkin road',
        source: thanksgivingWaiting,
      },
      {
        id: 'thanksgiving-lighthouse',
        label: 'Thanksgiving lighthouse causeway',
        source: thanksgivingLighthouse,
      },
      {
        id: 'thanksgiving-small-town',
        label: 'Thanksgiving small town',
        source: thanksgivingSmallTown,
      },
      {
        id: 'thanksgiving-cornfield',
        label: 'Thanksgiving cornfield',
        source: thanksgivingCornfield,
      },
      {
        id: 'thanksgiving-sunflowers',
        label: 'Thanksgiving sunflower road',
        source: thanksgivingSunflowers,
      },
    ],
    heroes: thanksgivingHeroes,
  },
  christmas: {
    id: 'christmas',
    name: 'Christmas',
    productId: CHRISTMAS_THEME_PRODUCT_ID,
    sky: '#1A263F',
    ambient: 'snow',
    hangmanCharacter: 'santa',
    freeCenterLabel: 'Holiday Ride!',
    extraBingoItems: christmasExtras,
    scenery: [
      {
        id: 'christmas-waiting',
        label: 'Christmas snow road',
        source: christmasWaiting,
      },
      {
        id: 'christmas-santa',
        label: 'Christmas Santa sleigh',
        source: christmasSanta,
      },
      {
        id: 'christmas-snowman',
        label: 'Christmas cottage snowman',
        source: christmasSnowman,
      },
      {
        id: 'christmas-tree',
        label: 'Christmas town tree',
        source: christmasTree,
      },
      {
        id: 'christmas-downtown',
        label: 'Christmas downtown',
        source: christmasDowntown,
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
  return getThemePack(themeId).heroes[variant];
}

export function sceneryRotationForTheme(themeId: ThemeId): GameSceneryEntry[] {
  const pack = getThemePack(themeId);
  return pack.scenery.length > 0 ? pack.scenery : gameSceneryRotation;
}
