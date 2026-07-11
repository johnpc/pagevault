import { describe, it, expect } from 'vitest';
import { tableOfContents, blockAnchorId } from './tocData';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

let n = 0;
const b = (type: BlockType, content: string): BlockRecord =>
  ({ id: `b${n++}`, type, content }) as unknown as BlockRecord;

describe('blockAnchorId', () => {
  it('prefixes the block id', () => {
    expect(blockAnchorId('abc')).toBe('pv-block-abc');
  });
});

describe('tableOfContents', () => {
  it('lists headings (level 1) and subheadings (level 2) in order', () => {
    const toc = tableOfContents([
      b('heading', 'Intro'),
      b('text', 'body'),
      b('subheading', 'Details'),
      b('heading', 'End'),
    ]);
    expect(toc.map((e) => [e.text, e.level])).toEqual([
      ['Intro', 1],
      ['Details', 2],
      ['End', 1],
    ]);
  });

  it('skips non-heading blocks and blank headings', () => {
    const toc = tableOfContents([b('heading', '   '), b('bullet', 'x'), b('subheading', 'Kept')]);
    expect(toc.map((e) => e.text)).toEqual(['Kept']);
  });

  it('carries each heading block id for anchoring', () => {
    const head = b('heading', 'Anchor me');
    const toc = tableOfContents([head]);
    expect(toc[0].id).toBe(head.id);
  });

  it('is empty when there are no headings', () => {
    expect(tableOfContents([b('text', 'a'), b('quote', 'q')])).toEqual([]);
  });
});
