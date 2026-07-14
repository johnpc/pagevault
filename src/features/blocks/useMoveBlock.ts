import { useCallback } from 'react';
import { useReorderBlocks } from './blockBatchApi';
import { moveBlock, sortUpdates } from './reorder';
import type { LatestRef } from '../../lib/useLatestRef';
import type { BlockRecord } from '../../lib/pbClient';

/** The drag-reorder action for a page's blocks: move `fromId` to `toId`'s
 * position and persist only the rows whose sort changed. Split from
 * useBlockActions to keep that hook under the line gate. Takes `blocks` as a
 * latest-ref so the returned handler stays identity-stable across edits. */
export function useMoveBlock(pageId: string, blocks: LatestRef<BlockRecord[]>) {
  const { mutate: reorderMutate } = useReorderBlocks(pageId);
  return useCallback(
    (fromId: string, toId: string) => {
      const reordered = moveBlock(blocks.current, fromId, toId);
      const updates = sortUpdates(reordered);
      if (updates.length) reorderMutate({ reordered, updates });
    },
    [blocks, reorderMutate],
  );
}
