import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hangmanPool, pickHangmanPhrase } from './hangmanDictionary';
import { normalizeHangmanPhrase } from '../games/hangman';

describe('hangmanDictionary', () => {
  it('ships one hundred unique phrases per difficulty', () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const pool = hangmanPool(difficulty);
      assert.equal(pool.length, 100);
      assert.equal(new Set(pool).size, 100);
    }
  });

  it('picks only from the requested difficulty', () => {
    const easy = new Set(hangmanPool('easy'));
    for (let i = 0; i < 40; i += 1) {
      const phrase = pickHangmanPhrase('easy', [], () => i / 40);
      assert.equal(easy.has(phrase), true);
      assert.equal(phrase.includes(' '), false);
    }
  });

  it('skips solved phrases until the tier is exhausted', () => {
    const pool = hangmanPool('easy');
    const solved = pool.slice(0, -1);
    const leftover = pool[pool.length - 1];
    const phrase = pickHangmanPhrase('easy', solved, () => 0);
    assert.equal(phrase, leftover);
  });

  it('recycles the full tier when every phrase is solved', () => {
    const pool = hangmanPool('hard');
    const solved = pool.map(normalizeHangmanPhrase);
    const phrase = pickHangmanPhrase('hard', solved, () => 0);
    assert.equal(phrase, pool[0]);
  });

  it('includes phrases on medium and hard', () => {
    assert.equal(hangmanPool('medium').some((phrase) => phrase.includes(' ')), true);
    assert.equal(hangmanPool('hard').some((phrase) => phrase.includes(' ')), true);
  });
});
