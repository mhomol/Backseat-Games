export const THEME_IDS = ['classic', 'thanksgiving', 'christmas'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export type PaidThemeId = Exclude<ThemeId, 'classic'>;

export type ThemeAmbient = 'classic' | 'leaves' | 'snow';

export type HangmanCharacter = 'hitchhiker' | 'pilgrim' | 'santa';

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return value === 'classic' || value === 'thanksgiving' || value === 'christmas';
}

export function isPaidThemeId(value: string | null | undefined): value is PaidThemeId {
  return value === 'thanksgiving' || value === 'christmas';
}
