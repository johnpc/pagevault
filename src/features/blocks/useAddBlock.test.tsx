import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { LatestRef } from '../../lib/useLatestRef';
import type { BlockRecord } from '../../lib/pbClient';

const createMutate = vi.fn();
const insertMutate = vi.fn();
vi.mock('./blocksApi', () => ({ useCreateBlock: () => ({ mutate: createMutate }) }));
vi.mock('./insertBlockApi', () => ({ useInsertBlockAfter: () => ({ mutate: insertMutate }) }));

import { useAddBlock } from './useAddBlock';

const blk = (id: string, type: string, content: string): BlockRecord =>
  ({ id, type, content }) as unknown as BlockRecord;
const ref = (blocks: BlockRecord[]): LatestRef<BlockRecord[]> => ({ current: blocks });

describe('useAddBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addBlock creates a block and focuses it on success', () => {
    const setFocusId = vi.fn();
    const { result } = renderHook(() => useAddBlock('p1', ref([]), setFocusId));
    result.current.addBlock('text');
    expect(createMutate).toHaveBeenCalledTimes(1);
    // Drive the onSuccess callback to prove it focuses the created block.
    createMutate.mock.calls[0][1].onSuccess({ id: 'new' });
    expect(setFocusId).toHaveBeenCalledWith('new');
  });

  it('clickBelow appends a fresh text block', () => {
    const setFocusId = vi.fn();
    const blocks = ref([blk('a', 'text', 'written')]);
    const { result } = renderHook(() => useAddBlock('p1', blocks, setFocusId));
    result.current.clickBelow();
    expect(createMutate).toHaveBeenCalledTimes(1);
    expect(createMutate.mock.calls[0][0]).toMatchObject({ type: 'text', content: '' });
  });

  it('focusFirstOrAdd focuses the existing first block', () => {
    const setFocusId = vi.fn();
    const blocks = ref([blk('first', 'text', 'hi'), blk('b', 'text', 'yo')]);
    const { result } = renderHook(() => useAddBlock('p1', blocks, setFocusId));
    result.current.focusFirstOrAdd();
    expect(setFocusId).toHaveBeenCalledWith('first');
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('focusFirstOrAdd adds a block when the page is empty', () => {
    const setFocusId = vi.fn();
    const { result } = renderHook(() => useAddBlock('p1', ref([]), setFocusId));
    result.current.focusFirstOrAdd();
    expect(createMutate).toHaveBeenCalledTimes(1);
  });

  it('insertAfter inserts below the source and focuses the created block', () => {
    const setFocusId = vi.fn();
    const source = blk('a', 'text', 'written');
    const blocks = ref([source]);
    const { result } = renderHook(() => useAddBlock('p1', blocks, setFocusId));
    result.current.insertAfter(source);
    expect(insertMutate).toHaveBeenCalledTimes(1);
    expect(insertMutate.mock.calls[0][0]).toMatchObject({ source });
    insertMutate.mock.calls[0][1].onSuccess({ id: 'new' });
    expect(setFocusId).toHaveBeenCalledWith('new');
  });
});
