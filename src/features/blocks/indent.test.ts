import { describe, it, expect } from 'vitest';
import { maxDepthAt, indentDepth } from './indent';
import type { BlockRecord } from '../../lib/pbClient';

const b = (depth: number): BlockRecord => ({ id: String(depth), depth }) as unknown as BlockRecord;

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
