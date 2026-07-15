import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { LatestRef } from '../../lib/useLatestRef';
import type { BlockRecord } from '../../lib/pbClient';

const dupMutate = vi.fn();
const dupManyMutate = vi.fn();
vi.mock('./blocksApi', () => ({ useDuplicateBlock: () => ({ mutate: dupMutate }) }));
vi.mock('./duplicateManyApi', () => ({ useDuplicateMany: () => ({ mutate: dupManyMutate }) }));

import { useCloneBlocks } from './useCloneBlocks';

const b = (id: string): BlockRecord => ({ id, content: id }) as unknown as BlockRecord;
const ref = (blocks: BlockRecord[]): LatestRef<BlockRecord[]> => ({ current: blocks });

describe('useCloneBlocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cloneBlock duplicates one block against the live blocks', () => {
    const src = b('a');
    const { result } = renderHook(() => useCloneBlocks('p1', ref([src])));
    result.current.cloneBlock(src);
    expect(dupMutate).toHaveBeenCalledWith({ source: src, blocks: [src] });
  });

  it('duplicateMany resolves ids to their records (in id order) and skips unknowns', () => {
    const blocks = [b('a'), b('b'), b('c')];
    const { result } = renderHook(() => useCloneBlocks('p1', ref(blocks)));
    result.current.duplicateMany(['b', 'c', 'missing']);
    expect(dupManyMutate).toHaveBeenCalledWith({ sources: [blocks[1], blocks[2]], blocks });
  });

  it('duplicateMany does nothing when no ids resolve', () => {
    const { result } = renderHook(() => useCloneBlocks('p1', ref([b('a')])));
    result.current.duplicateMany(['nope']);
    expect(dupManyMutate).not.toHaveBeenCalled();
  });
});
