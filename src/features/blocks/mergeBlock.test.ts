import { describe, it, expect } from 'vitest';
import { mergeTarget, MERGEABLE_TYPES } from './mergeBlock';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

const mk = (id: string, type: BlockType, content: string): BlockRecord =>
  ({ id, type, content }) as unknown as BlockRecord;

describe('mergeTarget', () => {
  it('merges a block into the previous one, caret at the join', () => {
    const blocks = [mk('a', 'text', 'Hello'), mk('b', 'text', 'World')];
    expect(mergeTarget(blocks, 'b', 'World')).toEqual({
      prev: blocks[0],
      content: 'HelloWorld',
      caret: 5,
    });
  });

  it('returns null for the first block (nothing above)', () => {
    const blocks = [mk('a', 'text', 'Hello'), mk('b', 'text', 'World')];
    expect(mergeTarget(blocks, 'a', 'Hello')).toBeNull();
  });

  it('returns null when the id is not present', () => {
    expect(mergeTarget([mk('a', 'text', 'x')], 'missing', '')).toBeNull();
  });

  it('merges across compatible text-ish types (heading absorbs a paragraph)', () => {
    const blocks = [mk('a', 'heading', 'Title'), mk('b', 'text', 'body')];
    expect(mergeTarget(blocks, 'b', 'body')?.content).toBe('Titlebody');
  });

  it('does not merge when the previous block is structural (divider)', () => {
    const blocks = [mk('a', 'divider', ''), mk('b', 'text', 'World')];
    expect(mergeTarget(blocks, 'b', 'World')).toBeNull();
  });

  it('does not merge when the source is a non-text body (code)', () => {
    const blocks = [mk('a', 'text', 'Hello'), mk('b', 'code', 'x=1')];
    expect(mergeTarget(blocks, 'b', 'World')).toBeNull();
  });

  it('joining an empty source keeps the previous content and caret at its end', () => {
    const blocks = [mk('a', 'text', 'Hello'), mk('b', 'text', '')];
    expect(mergeTarget(blocks, 'b', '')).toEqual({ prev: blocks[0], content: 'Hello', caret: 5 });
  });

  it('MERGEABLE_TYPES covers the text-ish list, not media/structural', () => {
    expect(MERGEABLE_TYPES.has('bullet')).toBe(true);
    expect(MERGEABLE_TYPES.has('quote')).toBe(true);
    expect(MERGEABLE_TYPES.has('image')).toBe(false);
    expect(MERGEABLE_TYPES.has('table')).toBe(false);
  });
});
