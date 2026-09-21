import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mergeSpottedPlates } from './plateCollectionStorage';

describe('mergeSpottedPlates', () => {
  it('keeps prior spots when merging', () => {
    assert.deepEqual(mergeSpottedPlates(['CA', 'TX'], ['TX', 'NY']), ['CA', 'NY', 'TX']);
  });
});
