import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MULTIPLAYER_COMING_SOON_MESSAGE } from './platformFeatures';

describe('platformFeatures', () => {
  it('coming soon copy mentions Android and Solo Mode', () => {
    assert.match(MULTIPLAYER_COMING_SOON_MESSAGE, /coming soon/i);
    assert.match(MULTIPLAYER_COMING_SOON_MESSAGE, /Android/i);
    assert.match(MULTIPLAYER_COMING_SOON_MESSAGE, /Solo Mode/i);
  });
});
