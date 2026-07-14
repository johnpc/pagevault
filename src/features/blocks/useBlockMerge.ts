import { useCallback } from 'react';
import { useMergeBlock } from './mergeBlockApi';
import { mergeTarget, forwardMergeTarget, type MergeTarget } from './mergeBlock';
import type { BlockRecord } from '../../lib/pbClient';

interface Deps {
  /** Focus a block, place the caret at `caret` (the merge join point), and seed
   * its value with the merged `content`. */
  focusAt: (id: string, caret: number, content: string) => void;
}

/**
 * The two block-joining gestures, both the reverse of Enter's split:
 *   mergeUp   — Backspace at the very start: fold this block into the one above.
 *   mergeDown — Delete at the very end: pull the next block up into this one.
 * Either way the kept block absorbs the text, the other is removed, and the
 * caret lands at the join. Each returns true when it merged (caller prevents the
 * default), false to fall through to normal Backspace/Delete. The LIVE textarea
 * value is passed in because an unsaved edit hasn't reached the cached record.
 */
export function useBlockMerge(pageId: string, blocks: BlockRecord[], deps: Deps) {
  const mergeMut = useMergeBlock(pageId);
  const { focusAt } = deps;

  const run = useCallback(
    (target: MergeTarget | null): boolean => {
      if (!target) return false;
      mergeMut.mutate({
        keepId: target.keepId,
        removeId: target.removeId,
        content: target.content,
      });
      // Seed the kept block's value + caret directly: it's about to be focused,
      // after which useReconciled won't adopt the optimistic cache write.
      focusAt(target.focusId, target.caret, target.content);
      return true;
    },
    [mergeMut, focusAt],
  );

  const mergeUp = useCallback(
    (id: string, value: string) => run(mergeTarget(blocks, id, value)),
    [blocks, run],
  );
  const mergeDown = useCallback(
    (id: string, value: string) => run(forwardMergeTarget(blocks, id, value)),
    [blocks, run],
  );

  return { mergeUp, mergeDown };
}
