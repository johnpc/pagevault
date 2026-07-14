import { useCallback } from 'react';
import { useSetDepths } from './blockBatchApi';
import { indentUpdates } from './indent';
import type { LatestRef } from '../../lib/useLatestRef';
import type { BlockRecord } from '../../lib/pbClient';

/** The indent/outdent actions for a page's blocks (Tab / Shift+Tab). `indentMany`
 * re-parents a range under the same cap logic; `indentBlock` is the one-id case.
 * Reads blocks via a latest-ref so both handlers stay identity-stable. */
export function useIndent(pageId: string, blocks: LatestRef<BlockRecord[]>) {
  const { mutate: setDepthsMutate } = useSetDepths(pageId);

  const indentMany = useCallback(
    (ids: string[], dir: 'in' | 'out') => {
      const updates = indentUpdates(blocks.current, ids, dir);
      if (updates.length) setDepthsMutate(updates);
    },
    [blocks, setDepthsMutate],
  );
  const indentBlock = useCallback(
    (id: string, dir: 'in' | 'out') => indentMany([id], dir),
    [indentMany],
  );

  return { indentBlock, indentMany };
}
