import { describe, it, expect } from 'vitest';
import { BLOCK_COLORS, colorClass } from './blockColors';

describe('colorClass', () => {
  it('maps a known token to its CSS class', () => {
    expect(colorClass('red')).toBe('pv-color--red');
    expect(colorClass('yellow-bg')).toBe('pv-color--yellow-bg');
  });

  it('returns empty for the default, undefined, or an unknown token', () => {
    expect(colorClass('')).toBe('');
    expect(colorClass(undefined)).toBe('');
    expect(colorClass('chartreuse')).toBe('');
  });

  it('every palette token (except default) maps to a class', () => {
    for (const c of BLOCK_COLORS) {
      if (c.token === '') expect(colorClass(c.token)).toBe('');
      else expect(colorClass(c.token)).toBe(`pv-color--${c.token}`);
    }
  });
});
