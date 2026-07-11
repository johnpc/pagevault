/**
 * Update one block, optimistically. The patch is applied to the cached block
 * list immediately so a follow-on action (e.g. pressing Enter right after a "- "
 * shortcut converts the block to a bullet) sees the new value without waiting
 * for the server round-trip; rolls back on error. Split from blocksApi to keep
 * each file small.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';

const key = (pageId: string) => ['blocks', pageId];

export function useUpdateBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; patch: Partial<BlockRecord> }) =>
      pb.collection('blocks').update<BlockRecord>(input.id, input.patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: key(pageId) });
      const previous = qc.getQueryData<BlockRecord[]>(key(pageId));
      qc.setQueryData<BlockRecord[]>(key(pageId), (old) =>
        old?.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key(pageId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}
