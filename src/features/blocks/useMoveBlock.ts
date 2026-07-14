import { useCallback } from 'react';
import { useReorderBlocks } from './blockBatchApi';
import { moveBlock, sortUpdates } from './reorder';
import type { BlockRecord } from '../../lib/pbClient';

/** The drag-reorder action for a page's blocks: move `fromId` to `toId`'s
 * position and persist only the rows whose sort changed. Split from
 * useBlockActions to keep that hook under the line gate. */
export function useMoveBlock(pageId: string, blocks: BlockRecord[]) {
  const reorderBlocks = useReorderBlocks(pageId);
  return useCallback(
    (fromId: string, toId: string) => {
      const reordered = moveBlock(blocks, fromId, toId);
      const updates = sortUpdates(reordered);
      if (updates.length) reorderBlocks.mutate({ reordered, updates });
    },
    [blocks, reorderBlocks],
  );
}
