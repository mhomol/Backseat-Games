import type { ImageSourcePropType } from 'react-native';
import { bingoItemImages } from './bingoItemImages';

/** Category-level on-brand icons for Travel Bingo (emoji remains last-resort fallback). */
export const bingoCategoryImages: Record<string, ImageSourcePropType> = {
  animals: require('../../assets/bingo-icons/animals.png'),
  signs: require('../../assets/bingo-icons/signs.png'),
  vehicles: require('../../assets/bingo-icons/vehicles.png'),
  businesses: require('../../assets/bingo-icons/businesses.png'),
  landmarks: require('../../assets/bingo-icons/landmarks.png'),
  scenery: require('../../assets/bingo-icons/scenery.png'),
};

export function bingoImageForCategory(
  category: string | undefined,
): ImageSourcePropType | undefined {
  if (!category) {
    return undefined;
  }
  return bingoCategoryImages[category];
}

/** Prefer per-item art, then category art. */
export function bingoImageForSquare(
  itemId: string | undefined,
  category: string | undefined,
): ImageSourcePropType | undefined {
  if (itemId && bingoItemImages[itemId]) {
    return bingoItemImages[itemId];
  }
  return bingoImageForCategory(category);
}
