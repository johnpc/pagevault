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

  it('treats both *word* and _word_ as italic', () => {
    expect(parseInline('_i_')).toEqual([{ text: 'i', italic: true }]);
    expect(parseInline('a _mid_ b')).toEqual([
      { text: 'a ' },
      { text: 'mid', italic: true },
      { text: ' b' },
    ]);
  });

  it('keeps __word__ as underline (not double-italic) despite the new _ rule', () => {
    expect(parseInline('__u__')).toEqual([{ text: 'u', underline: true }]);
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

  it('parses strikethrough (~~) and underline (__)', () => {
    expect(parseInline('~~gone~~')).toEqual([{ text: 'gone', strike: true }]);
    expect(parseInline('__under__')).toEqual([{ text: 'under', underline: true }]);
  });

  it('mixes strike/underline with plain text in order', () => {
    expect(parseInline('a ~~b~~ __c__')).toEqual([
      { text: 'a ' },
      { text: 'b', strike: true },
      { text: ' ' },
      { text: 'c', underline: true },
    ]);
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

  it('parses a [text](url) link into an href segment', () => {
    expect(parseInline('see [docs](https://ex.com) now')).toEqual([
      { text: 'see ' },
      { text: 'docs', href: 'https://ex.com' },
      { text: ' now' },
    ]);
  });

  it('autolinks a bare http(s) URL', () => {
    expect(parseInline('go to https://ex.com/a?b=1 ok')).toEqual([
      { text: 'go to ' },
      { text: 'https://ex.com/a?b=1', href: 'https://ex.com/a?b=1' },
      { text: ' ok' },
    ]);
  });

  it('prefers an explicit [text](url) link over autolinking the URL inside it', () => {
    expect(parseInline('[site](https://ex.com)')).toEqual([
      { text: 'site', href: 'https://ex.com' },
    ]);
  });

  it('prefers a mention over a same-position link', () => {
    expect(parseInline('@[Page](p1)')).toEqual([{ text: 'Page', mentionId: 'p1' }]);
  });
});

describe('hasInlineMarkup', () => {
  it('is true only when a mark or mention is present', () => {
    expect(hasInlineMarkup('plain')).toBe(false);
    expect(hasInlineMarkup('has **bold**')).toBe(true);
    expect(hasInlineMarkup('has `code`')).toBe(true);
    expect(hasInlineMarkup('has @[Page](p1)')).toBe(true);
    expect(hasInlineMarkup('has ~~strike~~')).toBe(true);
    expect(hasInlineMarkup('has __underline__')).toBe(true);
    expect(hasInlineMarkup('has [a](https://ex.com)')).toBe(true);
    expect(hasInlineMarkup('has https://ex.com')).toBe(true);
  });
});
