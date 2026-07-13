import { describe, it, expect } from 'vitest';
import { viewerHue } from './viewerHue';

describe('viewerHue', () => {
  it('is deterministic for the same id', () => {
    expect(viewerHue('user-1')).toBe(viewerHue('user-1'));
  });

  it('produces a valid hsl() string in range', () => {
    const m = /^hsl\((\d+) 55% 45%\)$/.exec(viewerHue('abc'));
    expect(m).not.toBeNull();
    expect(Number(m![1])).toBeGreaterThanOrEqual(0);
    expect(Number(m![1])).toBeLessThan(360);
  });

  it('differs for different ids (typically)', () => {
    expect(viewerHue('alice')).not.toBe(viewerHue('bob'));
  });
});
