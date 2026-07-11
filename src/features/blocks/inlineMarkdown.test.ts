import { describe, it, expect } from 'vitest';
import { parseInline, hasInlineMarkup } from './inlineMarkdown';

describe('parseInline', () => {
  it('returns nothing for empty and a single plain segment for plain text', () => {
    expect(parseInline('')).toEqual([]);
    expect(parseInline('just text')).toEqual([{ text: 'just text' }]);
  });

  it('parses bold, italic, and code', () => {
    expect(parseInline('**b**')).toEqual([{ text: 'b', bold: true }]);
    expect(parseInline('*i*')).toEqual([{ text: 'i', italic: true }]);
    expect(parseInline('`c`')).toEqual([{ text: 'c', code: true }]);
  });

  it('keeps surrounding plain text', () => {
    expect(parseInline('a **b** c')).toEqual([
      { text: 'a ' },
      { text: 'b', bold: true },
      { text: ' c' },
    ]);
  });

  it('handles multiple marks in order, bold before italic', () => {
    expect(parseInline('**b** and *i*')).toEqual([
      { text: 'b', bold: true },
      { text: ' and ' },
      { text: 'i', italic: true },
    ]);
  });

  it('treats code contents literally (no nested emphasis)', () => {
    expect(parseInline('`a*b*c`')).toEqual([{ text: 'a*b*c', code: true }]);
  });

  it('parses a page mention into a mention segment', () => {
    expect(parseInline('see @[Trip](p1) today')).toEqual([
      { text: 'see ' },
      { text: 'Trip', mentionId: 'p1' },
      { text: ' today' },
    ]);
  });

  it('does not re-parse emphasis inside a mention title', () => {
    expect(parseInline('@[a*b*c](p1)')).toEqual([{ text: 'a*b*c', mentionId: 'p1' }]);
  });
});

describe('hasInlineMarkup', () => {
  it('is true only when a mark or mention is present', () => {
    expect(hasInlineMarkup('plain')).toBe(false);
    expect(hasInlineMarkup('has **bold**')).toBe(true);
    expect(hasInlineMarkup('has `code`')).toBe(true);
    expect(hasInlineMarkup('has @[Page](p1)')).toBe(true);
  });
});
