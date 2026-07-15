import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { LatestRef } from '../../lib/useLatestRef';
import type { BlockRecord } from '../../lib/pbClient';
import { useCopyBlocks } from './useCopyBlocks';

const writeText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, { clipboard: { writeText } });

const blk = (id: string, content: string): BlockRecord =>
  ({ id, type: 'text', content, depth: 0 }) as BlockRecord;
const ref = (blocks: BlockRecord[]): LatestRef<BlockRecord[]> => ({ current: blocks });

describe('useCopyBlocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes the selected blocks (in id order) to the clipboard as markdown', () => {
    const blocks = [blk('a', 'Alpha'), blk('b', 'Bravo'), blk('c', 'Charlie')];
    const { result } = renderHook(() => useCopyBlocks(ref(blocks)));
    result.current(['b', 'c']);
    expect(writeText).toHaveBeenCalledWith('Bravo\n\nCharlie');
  });

  it('does nothing when no ids resolve to a block', () => {
    const { result } = renderHook(() => useCopyBlocks(ref([blk('a', 'Alpha')])));
    result.current(['missing']);
    expect(writeText).not.toHaveBeenCalled();
  });
});
