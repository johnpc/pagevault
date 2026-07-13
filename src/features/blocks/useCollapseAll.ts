import { useCallback } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { useSetToggles } from './blockBatchApi';
import { toggleBlocks, shouldCollapseAll, collapseUpdates } from './collapseAll';

/** The collapse-all control surface passed to the page actions row. */
export interface CollapseAll {
  hasToggles: boolean;
  willCollapse: boolean;
  collapseAll: () => void;
}

/** The page-level "collapse/expand all toggles" action. Exposes whether the
 * page has any toggles, whether the next action collapses (vs expands) them, and
 * a handler that batches the flip in one mutation. */
export function useCollapseAll(pageId: string, blocks: BlockRecord[]): CollapseAll {
  const setToggles = useSetToggles(pageId);
  const hasToggles = toggleBlocks(blocks).length > 0;
  const willCollapse = shouldCollapseAll(blocks);

  const collapseAll = useCallback(() => {
    const updates = collapseUpdates(blocks, willCollapse);
    if (updates.length) setToggles.mutate(updates);
  }, [blocks, willCollapse, setToggles]);

  return { hasToggles, willCollapse, collapseAll };
}
