import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

const key = (pageId: string) => ['blocks', pageId];

/**
 * Batch turn-into helper: `typeMany(ids, type)` converts many blocks' `type` in
 * one optimistic mutation — turns a whole block selection into another text-body
 * type, keeping their content. Same field-only, id-keyed shape as useSetColors;
 * its own file keeps callers under the line gate. Returns a stable callback.
 */
export function useSetTypes(pageId: string): (ids: string[], type: BlockType) => void {
  const qc = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (updates: { id: string; type: BlockType }[]) =>
      Promise.all(updates.map((u) => pb.collection('blocks').update(u.id, { type: u.type }))),
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: key(pageId) });
      const previous = qc.getQueryData<BlockRecord[]>(key(pageId));
      const byId = new Map(updates.map((u) => [u.id, u.type]));
      qc.setQueryData<BlockRecord[]>(key(pageId), (old) =>
        old?.map((b) => (byId.has(b.id) ? { ...b, type: byId.get(b.id)! } : b)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key(pageId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
  return useCallback((ids, type) => mutate(ids.map((id) => ({ id, type }))), [mutate]);
}
