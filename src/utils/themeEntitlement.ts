import { PAID_THEME_PRODUCT_IDS } from '../types/purchases';
import type { PaidThemeId, ThemeId } from '../types/theme';
import { isPaidThemeId, isThemeId } from '../types/theme';

export function productIdForPaidTheme(themeId: PaidThemeId): string {
  return PAID_THEME_PRODUCT_IDS[themeId];
}

export function paidThemeIdForProduct(productId: string): PaidThemeId | null {
  for (const [themeId, sku] of Object.entries(PAID_THEME_PRODUCT_IDS) as Array<
    [PaidThemeId, string]
  >) {
    if (sku === productId) {
      return themeId;
    }
  }
  return null;
}

export function uniquePaidThemes(ids: ReadonlyArray<string>): PaidThemeId[] {
  const next: PaidThemeId[] = [];
  for (const id of ids) {
    if (isPaidThemeId(id) && !next.includes(id)) {
      next.push(id);
    }
  }
  return next;
}

export function ownedThemesFromPurchases(
  purchases: ReadonlyArray<{ productId?: string | null }>,
): PaidThemeId[] {
  const ids: PaidThemeId[] = [];
  for (const purchase of purchases) {
    const themeId = paidThemeIdForProduct(purchase.productId ?? '');
    if (themeId && !ids.includes(themeId)) {
      ids.push(themeId);
    }
  }
  return ids;
}

export function mergeOwnedThemes(
  cached: ReadonlyArray<PaidThemeId>,
  fromStore: ReadonlyArray<PaidThemeId>,
): PaidThemeId[] {
  return uniquePaidThemes([...cached, ...fromStore]);
}

export function ownsTheme(
  themeId: ThemeId,
  ownedThemeIds: ReadonlyArray<PaidThemeId>,
): boolean {
  if (themeId === 'classic') {
    return true;
  }
  return ownedThemeIds.includes(themeId);
}

/** Apply only Classic or a theme this Apple ID owns. */
export function resolveSelectableTheme(
  requested: string | null | undefined,
  ownedThemeIds: ReadonlyArray<PaidThemeId>,
): ThemeId {
  if (!isThemeId(requested) || !ownsTheme(requested, ownedThemeIds)) {
    return 'classic';
  }
  return requested;
}

export function parseStoredThemeId(value: unknown): ThemeId {
  return typeof value === 'string' && isThemeId(value) ? value : 'classic';
}
