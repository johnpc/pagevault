import { describe, it, expect } from 'vitest';
import { hiddenBlockIds, toggleHasChildren } from './toggle';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

let n = 0;
const b = (type: BlockType, depth: number, collapsed = false): BlockRecord =>
  ({ id: `b${n++}`, type, depth, collapsed, content: '' }) as unknown as BlockRecord;

describe('hiddenBlockIds', () => {
  it('hides the deeper run after a collapsed toggle', () => {
    const list = [b('toggle', 0, true), b('text', 1), b('text', 1), b('text', 0)];
    const hidden = hiddenBlockIds(list);
    expect(hidden.has(list[1].id)).toBe(true);
    expect(hidden.has(list[2].id)).toBe(true);
    // The block back at depth 0 is a sibling — visible.
    expect(hidden.has(list[3].id)).toBe(false);
  });

  it('hides nothing when the toggle is expanded', () => {
    const list = [b('toggle', 0, false), b('text', 1)];
    expect(hiddenBlockIds(list).size).toBe(0);
  });

  it('keeps deeply nested children hidden inside a collapsed toggle', () => {
    const list = [b('toggle', 0, true), b('text', 1), b('text', 2), b('text', 1)];
    expect(hiddenBlockIds(list).size).toBe(3);
  });

  it('a non-toggle block never hides anything even if collapsed is set', () => {
    const list = [b('text', 0, true), b('text', 1)];
    expect(hiddenBlockIds(list).size).toBe(0);
  });
});

describe('toggleHasChildren', () => {
  it('is true when the next block is deeper', () => {
    expect(toggleHasChildren([b('toggle', 0), b('text', 1)], 0)).toBe(true);
  });
  it('is false when the next block is a sibling', () => {
    expect(toggleHasChildren([b('toggle', 0), b('text', 0)], 0)).toBe(false);
  });
  it('is false at the end of the list', () => {
    expect(toggleHasChildren([b('toggle', 0)], 0)).toBe(false);
  });
});
