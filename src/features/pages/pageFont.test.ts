import { describe, it, expect } from 'vitest';
import { PAGE_FONTS, pageFontClass, pageFontLabel } from './pageFont';

describe('pageFont', () => {
  it('offers default, serif, and mono', () => {
    expect(PAGE_FONTS.map((f) => f.token)).toEqual(['default', 'serif', 'mono']);
  });

  it('maps tokens to their body class (default = none)', () => {
    expect(pageFontClass('default')).toBe('');
    expect(pageFontClass('serif')).toBe('pv-font-serif');
    expect(pageFontClass('mono')).toBe('pv-font-mono');
  });

  it('treats an empty/unknown token as the default (no class)', () => {
    expect(pageFontClass('')).toBe('');
    expect(pageFontClass('wingdings')).toBe('');
  });

  it('labels tokens (empty/unknown → Default)', () => {
    expect(pageFontLabel('serif')).toBe('Serif');
    expect(pageFontLabel('')).toBe('Default');
    expect(pageFontLabel('wingdings')).toBe('Default');
  });
});
