import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { REVIEW_COOLDOWN_MS, shouldPromptReview } from './reviewPromptLogic';

describe('shouldPromptReview', () => {
  it('prompts when never asked', () => {
    assert.equal(shouldPromptReview(null, Date.now()), true);
  });

  it('respects the 14-day cooldown', () => {
    const now = 1_700_000_000_000;
    assert.equal(shouldPromptReview(now, now + REVIEW_COOLDOWN_MS - 1), false);
    assert.equal(shouldPromptReview(now, now + REVIEW_COOLDOWN_MS), true);
  });
});
