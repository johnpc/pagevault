import { describe, it, expect } from 'vitest';
import { tagColor, TAG_HUES } from './tagColor';

describe('tagColor', () => {
  it('is deterministic — same name always maps to the same hue', () => {
    expect(tagColor('Urgent')).toBe(tagColor('Urgent'));
    expect(tagColor('In Progress')).toBe(tagColor('In Progress'));
  });

  it('only ever returns a known theme hue', () => {
    for (const name of ['Red', 'Blue', 'done', 'Q3 planning', 'x', '汉字']) {
      expect(TAG_HUES).toContain(tagColor(name));
    }
  });

  it('ignores surrounding whitespace (same tag, same color)', () => {
    expect(tagColor('  Blocked  ')).toBe(tagColor('Blocked'));
  });

  it('falls back to gray for an empty / blank name', () => {
    expect(tagColor('')).toBe('gray');
    expect(tagColor('   ')).toBe('gray');
  });

  it('spreads distinct names across more than one hue', () => {
    const hues = new Set(
      ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta'].map(tagColor),
    );
    expect(hues.size).toBeGreaterThan(1);
  });
});
