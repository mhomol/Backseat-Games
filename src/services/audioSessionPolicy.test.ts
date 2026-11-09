import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { canAttemptOpenJingle, shouldRetrySilentPlayback } from './audioSessionPolicy';

describe('canAttemptOpenJingle', () => {
  it('plays only when enabled, not yet played, and the app is active', () => {
    assert.equal(
      canAttemptOpenJingle({ alreadyPlayed: false, introEnabled: true, appState: 'active' }),
      true,
    );
    assert.equal(
      canAttemptOpenJingle({ alreadyPlayed: true, introEnabled: true, appState: 'active' }),
      false,
    );
    assert.equal(
      canAttemptOpenJingle({ alreadyPlayed: false, introEnabled: false, appState: 'active' }),
      false,
    );
    assert.equal(
      canAttemptOpenJingle({ alreadyPlayed: false, introEnabled: true, appState: 'background' }),
      false,
    );
  });
});

describe('shouldRetrySilentPlayback', () => {
  it('retries a stalled start, not a finished or progressing clip', () => {
    assert.equal(shouldRetrySilentPlayback({ playing: false, currentTime: 0, duration: 0.6 }), true);
    assert.equal(shouldRetrySilentPlayback({ playing: true, currentTime: 0, duration: 0.6 }), false);
    assert.equal(shouldRetrySilentPlayback({ playing: false, currentTime: 0.2, duration: 0.6 }), false);
    assert.equal(shouldRetrySilentPlayback({ playing: false, currentTime: 0.6, duration: 0.6 }), false);
  });
});
