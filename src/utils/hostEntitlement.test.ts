import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HOST_UNLOCK_PRODUCT_ID } from '../types/purchases';
import {
  canHostForPlatform,
  canStartHostedSession,
  hasHostUnlockPurchase,
  mergeHostEntitlement,
} from './hostEntitlement';

describe('hostEntitlement', () => {
  it('mergeHostEntitlement is true when either source is unlocked', () => {
    assert.equal(mergeHostEntitlement(false, false), false);
    assert.equal(mergeHostEntitlement(true, false), true);
    assert.equal(mergeHostEntitlement(false, true), true);
    assert.equal(mergeHostEntitlement(true, true), true);
  });

  it('hasHostUnlockPurchase matches the host unlock SKU', () => {
    assert.equal(hasHostUnlockPurchase([], HOST_UNLOCK_PRODUCT_ID), false);
    assert.equal(
      hasHostUnlockPurchase([{ productId: 'other.product' }], HOST_UNLOCK_PRODUCT_ID),
      false,
    );
    assert.equal(
      hasHostUnlockPurchase([{ productId: HOST_UNLOCK_PRODUCT_ID }], HOST_UNLOCK_PRODUCT_ID),
      true,
    );
  });

  it('canHostForPlatform allows dev and non-iOS paths when locked', () => {
    assert.equal(canHostForPlatform('android', { hostUnlocked: false, isDev: false }), true);
    assert.equal(canHostForPlatform('ios', { hostUnlocked: false, isDev: true }), true);
    assert.equal(canHostForPlatform('ios', { hostUnlocked: false, isDev: false }), false);
    assert.equal(canHostForPlatform('ios', { hostUnlocked: true, isDev: false }), true);
  });

  it('canStartHostedSession allows solo when locked; online needs unlock', () => {
    assert.equal(canStartHostedSession({ solo: true, canHost: false }), true);
    assert.equal(canStartHostedSession({ solo: true, canHost: true }), true);
    assert.equal(canStartHostedSession({ solo: false, canHost: false }), false);
    assert.equal(canStartHostedSession({ solo: false, canHost: true }), true);
  });
});
