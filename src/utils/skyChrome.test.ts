import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chromeForegroundForSky, statusBarStyleForSky } from './skyChrome';

describe('sky chrome', () => {
  it('uses dark ink on Thanksgiving oranges', () => {
    assert.equal(statusBarStyleForSky('#FD9C45'), 'dark');
    assert.equal(statusBarStyleForSky('#F67E20'), 'dark');
    assert.equal(chromeForegroundForSky('#FD9C45'), '#2D3436');
  });

  it('uses cream ink on Christmas navy', () => {
    assert.equal(statusBarStyleForSky('#1D2941'), 'light');
    assert.equal(chromeForegroundForSky('#1D2941'), '#FFF8EE');
  });
});
