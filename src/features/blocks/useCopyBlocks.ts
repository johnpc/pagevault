import { useCallback } from 'react';
import { blocksToMarkdown } from './selectionMarkdown';
import type { LatestRef } from '../../lib/useLatestRef';
import type { BlockRecord } from '../../lib/pbClient';

/**
 * Copy a block selection to the system clipboard as Markdown (Cmd/Ctrl+C while
 * blocks are selected). Pairs with the paste handler, which imports markdown
 * back into blocks — so this is cross-page and cross-app block copy. Resolves
 * ids to their live records (in id order), serializes, and writes text/plain.
 * Split from useBlockActions to keep it under the line gate.
 */
export function useCopyBlocks(blocksRef: LatestRef<BlockRecord[]>) {
  return useCallback(
    (ids: string[]) => {
      const byId = new Map(blocksRef.current.map((b) => [b.id, b]));
      const chosen = ids.map((id) => byId.get(id)).filter((b): b is BlockRecord => !!b);
      if (!chosen.length) return;
      void navigator.clipboard?.writeText(blocksToMarkdown(chosen));
    },
    [blocksRef],
  );
}
