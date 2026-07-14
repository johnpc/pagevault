/**
 * Merge two adjacent blocks into one — the reverse of a split. The kept block's
 * content becomes the joined text, and the other block is deleted. Used by
 * Backspace at the very start of a block (merge up) and Delete at the very end
 * (merge the next block down). Optimistic so the caret can be placed at the join
 * immediately; rolls back on error.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';

const key = (pageId: string) => ['blocks', pageId];

export interface MergeInput {
  /** The block that keeps its id and receives the joined content. */
  keepId: string;
  /** The block that is deleted (its text folded into keepId). */
  removeId: string;
  content: string;
}

export function useMergeBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ keepId, removeId, content }: MergeInput) => {
      await pb.collection('blocks').update(keepId, { content });
      await pb.collection('blocks').delete(removeId);
    },
    onMutate: async ({ keepId, removeId, content }) => {
      await qc.cancelQueries({ queryKey: key(pageId) });
      const previous = qc.getQueryData<BlockRecord[]>(key(pageId));
      qc.setQueryData<BlockRecord[]>(key(pageId), (old) =>
        old?.map((b) => (b.id === keepId ? { ...b, content } : b)).filter((b) => b.id !== removeId),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key(pageId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}
