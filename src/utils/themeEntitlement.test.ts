import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CHRISTMAS_THEME_PRODUCT_ID,
  HALLOWEEN_THEME_PRODUCT_ID,
  THANKSGIVING_THEME_PRODUCT_ID,
} from '../types/purchases';
import {
  mergeOwnedThemes,
  ownedThemesFromPurchases,
  ownsTheme,
  paidThemeIdForProduct,
  resolveSelectableTheme,
} from './themeEntitlement';

describe('themeEntitlement', () => {
  it('maps product IDs to paid themes', () => {
    assert.equal(paidThemeIdForProduct(THANKSGIVING_THEME_PRODUCT_ID), 'thanksgiving');
    assert.equal(paidThemeIdForProduct(CHRISTMAS_THEME_PRODUCT_ID), 'christmas');
    assert.equal(paidThemeIdForProduct(HALLOWEEN_THEME_PRODUCT_ID), 'halloween');
    assert.equal(paidThemeIdForProduct('other'), null);
  });

  it('Classic is always owned; paid themes need cache', () => {
    assert.equal(ownsTheme('classic', []), true);
    assert.equal(ownsTheme('thanksgiving', []), false);
    assert.equal(ownsTheme('thanksgiving', ['thanksgiving']), true);
  });

  it('resolveSelectableTheme falls back when unowned or invalid', () => {
    assert.equal(resolveSelectableTheme('thanksgiving', []), 'classic');
    assert.equal(resolveSelectableTheme('nope', ['christmas']), 'classic');
    assert.equal(resolveSelectableTheme('christmas', ['christmas']), 'christmas');
  });

  it('merges purchase lists without duplicates', () => {
    assert.deepEqual(
      mergeOwnedThemes(['thanksgiving'], ownedThemesFromPurchases([
        { productId: CHRISTMAS_THEME_PRODUCT_ID },
        { productId: THANKSGIVING_THEME_PRODUCT_ID },
      ])),
      ['thanksgiving', 'christmas'],
    );
  });
});
