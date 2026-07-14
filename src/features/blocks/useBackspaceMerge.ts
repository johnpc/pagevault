import { useCallback } from 'react';
import { useMergeBlock } from './mergeBlockApi';
import { mergeTarget } from './mergeBlock';
import type { BlockRecord } from '../../lib/pbClient';

interface Deps {
  /** Focus a block, place the caret at `caret` (the merge join point), and seed
   * its value with the merged `content`. */
  focusAt: (id: string, caret: number, content: string) => void;
}

/**
 * Backspace at the very start of a block merges it into the block above (the
 * reverse of Enter's split): the previous block absorbs this block's text and
 * this block is removed, with the caret left at the join. Returns true when it
 * merged so the caller prevents the default. No-op (returns false) when there's
 * no previous block or either isn't a mergeable text type — the caller then
 * falls back to the empty-block delete or a normal Backspace.
 */
export function useBackspaceMerge(pageId: string, blocks: BlockRecord[], deps: Deps) {
  const mergeMut = useMergeBlock(pageId);
  const { focusAt } = deps;

  return useCallback(
    (sourceId: string, sourceValue: string): boolean => {
      const target = mergeTarget(blocks, sourceId, sourceValue);
      if (!target) return false;
      mergeMut.mutate({ prevId: target.prev.id, sourceId, content: target.content });
      // Pass the merged content + caret explicitly: the absorbing block is about
      // to be focused, after which useReconciled won't adopt the optimistic cache
      // write (its mid-type guard), so we seed its value directly instead.
      focusAt(target.prev.id, target.caret, target.content);
      return true;
    },
    [blocks, mergeMut, focusAt],
  );
}
