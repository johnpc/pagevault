import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDeleteBlock, useRestoreBlocks } from './blocksApi';
import { showToast } from '../shell/toastBus';
import type { BlockRecord } from '../../lib/pbClient';

/** Delete one or more blocks and surface an Undo toast that restores them
 * (same ids/sort/content). Deletion is inherently destructive, so this makes it
 * reversible — the highest-value safety net in the editor.
 *
 * The records to restore are read from the live query cache (not a render
 * closure) so a just-blurred edit that optimistically updated the cache is
 * captured — otherwise Undo could restore pre-edit (stale/empty) content. */
export function useDeleteWithUndo(pageId: string, blocks: BlockRecord[]) {
  const qc = useQueryClient();
  const deleteBlock = useDeleteBlock(pageId);
  const restore = useRestoreBlocks(pageId);

  return useCallback(
    (id: string | string[]) => {
      const ids = Array.isArray(id) ? id : [id];
      const latest = qc.getQueryData<BlockRecord[]>(['blocks', pageId]) ?? blocks;
      const removed = latest.filter((b) => ids.includes(b.id));
      deleteBlock.mutate(id, {
        onSuccess: () => {
          const n = removed.length;
          const msg = n === 1 ? 'Block deleted.' : `${n} blocks deleted.`;
          showToast(msg, { label: 'Undo', run: () => restore.mutate(removed) });
        },
      });
    },
    [qc, pageId, blocks, deleteBlock, restore],
  );
}
