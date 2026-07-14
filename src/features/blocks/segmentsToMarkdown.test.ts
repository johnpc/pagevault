import { describe, it, expect } from 'vitest';
import { segmentToMarkdown, segmentsToMarkdown } from './segmentsToMarkdown';
import { parseInline, type Segment } from './inlineMarkdown';

describe('segmentToMarkdown', () => {
  it('wraps each mark in its canonical marker', () => {
    expect(segmentToMarkdown({ text: 'x', bold: true })).toBe('**x**');
    expect(segmentToMarkdown({ text: 'x', italic: true })).toBe('*x*');
    expect(segmentToMarkdown({ text: 'x', code: true })).toBe('`x`');
    expect(segmentToMarkdown({ text: 'x', strike: true })).toBe('~~x~~');
    expect(segmentToMarkdown({ text: 'x', underline: true })).toBe('__x__');
    expect(segmentToMarkdown({ text: 'Trip', mentionId: 'p1' })).toBe('@[Trip](p1)');
    expect(segmentToMarkdown({ text: 'docs', href: 'https://x' })).toBe('[docs](https://x)');
    expect(segmentToMarkdown({ text: 'plain' })).toBe('plain');
  });
});

describe('round-trip with parseInline', () => {
  // The bridge must be lossless in BOTH directions for the editor to be safe.
  const strings = [
    'plain text',
    'a **bold** b',
    'has *italic* and `code`',
    '~~gone~~ and __under__',
    'see @[Trip](p1) today',
    'read [docs](https://ex.com) now',
    '**b** *i* `c` ~~s~~ __u__',
  ];
  it('string → segments → string is identity', () => {
    for (const s of strings) {
      expect(segmentsToMarkdown(parseInline(s))).toBe(s);
    }
  });
  it('segments → string → segments is identity', () => {
    const segs: Segment[][] = [
      [{ text: 'a ' }, { text: 'b', bold: true }, { text: ' c' }],
      [{ text: 'Trip', mentionId: 'p1' }],
      [{ text: 'x', code: true }],
      [{ text: 'link', href: 'https://y' }],
    ];
    for (const seg of segs) {
      expect(parseInline(segmentsToMarkdown(seg))).toEqual(seg);
    }
  });
});
