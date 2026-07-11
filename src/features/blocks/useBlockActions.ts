import { useCallback } from 'react';
import {
  useCreateBlock,
  useUpdateBlock,
  useDeleteBlock,
  useReorderBlocks,
  useDuplicateBlock,
} from './blocksApi';
import { moveBlock, sortUpdates } from './reorder';
import { indentDepth } from './indent';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

/**
 * The block-list mutations for one page: add, edit, remove, and drag-reorder.
 * Split out of usePageEditor so each surface stays small and single-purpose.
 */
export function useBlockActions(pageId: string, blocks: BlockRecord[]) {
  const createBlock = useCreateBlock(pageId);
  const updateBlock = useUpdateBlock(pageId);
  const deleteBlock = useDeleteBlock(pageId);
  const reorderBlocks = useReorderBlocks(pageId);
  const duplicateBlock = useDuplicateBlock(pageId);

  const addBlock = useCallback(
    (type: BlockType = 'text') => createBlock.mutate({ type, content: '', siblings: blocks }),
    [createBlock, blocks],
  );

  const editBlock = useCallback(
    (id: string, patch: Partial<BlockRecord>) => updateBlock.mutate({ id, patch }),
    [updateBlock],
  );

  const moveBlockTo = useCallback(
    (fromId: string, toId: string) => {
      const reordered = moveBlock(blocks, fromId, toId);
      const updates = sortUpdates(reordered);
      if (updates.length) reorderBlocks.mutate({ reordered, updates });
    },
    [blocks, reorderBlocks],
  );

  const cloneBlock = useCallback(
    (source: BlockRecord) => duplicateBlock.mutate({ source, blocks }),
    [duplicateBlock, blocks],
  );

  const indentBlock = useCallback(
    (id: string, dir: 'in' | 'out') => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      const depth = indentDepth(blocks, index, dir);
      if (depth !== (blocks[index].depth ?? 0)) updateBlock.mutate({ id, patch: { depth } });
    },
    [blocks, updateBlock],
  );

  return {
    addBlock,
    editBlock,
    moveBlockTo,
    cloneBlock,
    indentBlock,
    removeBlock: deleteBlock.mutate,
  };
}
