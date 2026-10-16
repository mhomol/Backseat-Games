export const THEME_IDS = ['classic', 'halloween', 'thanksgiving', 'christmas'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export type PaidThemeId = Exclude<ThemeId, 'classic'>;

export type ThemeAmbient = 'classic' | 'leaves' | 'snow' | 'halloween';

export type HangmanCharacter = 'hitchhiker' | 'pilgrim' | 'santa' | 'ghost';

export function isThemeId(value: string | null | undefined): value is ThemeId {
  return (
    value === 'classic' ||
    value === 'halloween' ||
    value === 'thanksgiving' ||
    value === 'christmas'
  );
}

export function isPaidThemeId(value: string | null | undefined): value is PaidThemeId {
  return value === 'halloween' || value === 'thanksgiving' || value === 'christmas';
}
