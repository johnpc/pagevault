/**
 * Merge a block into the one above it — the reverse of a split. The previous
 * block's content becomes prev + source, and the source block is deleted. Used
 * by Backspace at the very start of a block (Notion behavior). Optimistic so the
 * caret can be placed at the join immediately; rolls back on error.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';

const key = (pageId: string) => ['blocks', pageId];

export interface MergeInput {
  prevId: string;
  sourceId: string;
  content: string;
}

export function useMergeBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ prevId, sourceId, content }: MergeInput) => {
      await pb.collection('blocks').update(prevId, { content });
      await pb.collection('blocks').delete(sourceId);
    },
    onMutate: async ({ prevId, sourceId, content }) => {
      await qc.cancelQueries({ queryKey: key(pageId) });
      const previous = qc.getQueryData<BlockRecord[]>(key(pageId));
      qc.setQueryData<BlockRecord[]>(key(pageId), (old) =>
        old?.map((b) => (b.id === prevId ? { ...b, content } : b)).filter((b) => b.id !== sourceId),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key(pageId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}
