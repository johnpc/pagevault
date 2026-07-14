import { describe, it, expect } from 'vitest';
import { maxDepthAt, indentDepth, indentUpdates } from './indent';
import type { BlockRecord } from '../../lib/pbClient';

const b = (depth: number): BlockRecord => ({ id: String(depth), depth }) as unknown as BlockRecord;
/** A block with an explicit id + depth (multi-block indent needs distinct ids). */
const bid = (id: string, depth: number): BlockRecord => ({ id, depth }) as unknown as BlockRecord;

describe('maxDepthAt', () => {
  it('is 0 at the top of the list', () => {
    expect(maxDepthAt([b(0), b(0)], 0)).toBe(0);
  });
  it('is one deeper than the block above', () => {
    expect(maxDepthAt([b(0), b(0)], 1)).toBe(1);
    expect(maxDepthAt([b(2), b(0)], 1)).toBe(3);
  });
});

describe('indentDepth', () => {
  it('indents up to one past the previous block', () => {
    const list = [b(0), b(0)];
    expect(indentDepth(list, 1, 'in')).toBe(1);
  });
  it('will not indent past the cap (no orphan jump)', () => {
    // already at max (prev is 0 → cap 1); a second indent would exceed cap.
    expect(indentDepth([b(0), b(1)], 1, 'in')).toBe(1);
  });
  it('cannot indent the first block', () => {
    expect(indentDepth([b(0)], 0, 'in')).toBe(0);
  });
  it('outdents toward 0 and floors there', () => {
    expect(indentDepth([b(0), b(2)], 1, 'out')).toBe(1);
    expect(indentDepth([b(0)], 0, 'out')).toBe(0);
  });
});

describe('indentUpdates', () => {
  // a(0) b(0) c(0): each block indents by at most one level per press, so b→1
  // and c→1 (its cap under b's new depth 1 is 2, but +1 from 0 is just 1).
  const blocks = [bid('a', 0), bid('b', 0), bid('c', 0)];

  it('indents each selected block by one level (top-down, capped by the one above)', () => {
    expect(indentUpdates(blocks, ['b', 'c'], 'in')).toEqual([
      { id: 'b', depth: 1 },
      { id: 'c', depth: 1 },
    ]);
  });

  it('outdents selected blocks, flooring at 0', () => {
    const nested = [bid('a', 0), bid('b', 1), bid('c', 2)];
    expect(indentUpdates(nested, ['b', 'c'], 'out')).toEqual([
      { id: 'b', depth: 0 },
      { id: 'c', depth: 1 },
    ]);
  });

  it('omits blocks whose depth would not change', () => {
    // b is already at its max (1, under a); indenting again is a no-op for it.
    expect(indentUpdates([bid('a', 0), bid('b', 1)], ['b'], 'in')).toEqual([]);
  });
});
