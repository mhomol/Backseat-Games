import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { layoutHangmanMaskRows } from './hangmanMaskLayout';

describe('layoutHangmanMaskRows', () => {
  it('keeps a short phrase on one row without wrapping a word', () => {
    const rows = layoutHangmanMaskRows('C A T   N A P', 8);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].length, 2);
    assert.deepEqual(
      rows[0][0].map((token) => token.char ?? token.kind),
      ['C', 'A', 'T'],
    );
  });

  it('wraps at a word boundary without a hyphen', () => {
    const rows = layoutHangmanMaskRows('C A T   N A P', 3);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].length, 1);
    assert.equal(rows[1].length, 1);
    assert.ok(rows[0][0].every((token) => token.kind !== 'hyphen'));
    assert.ok(rows[1][0].every((token) => token.kind !== 'hyphen'));
  });

  it('hyphenates a word that cannot fit on one row', () => {
    const rows = layoutHangmanMaskRows('A B C D E F', 4);
    assert.equal(rows.length, 2);
    assert.equal(rows[0][0].at(-1)?.kind, 'hyphen');
    assert.deepEqual(
      rows[0][0].slice(0, 3).map((token) => token.char),
      ['A', 'B', 'C'],
    );
    assert.deepEqual(
      rows[1][0].map((token) => token.char),
      ['D', 'E', 'F'],
    );
  });
});
