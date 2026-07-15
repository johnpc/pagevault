import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';

const key = (pageId: string) => ['blocks', pageId];

/**
 * Batch-color helper: `colorMany(ids, color)` sets many blocks' `color` in one
 * optimistic mutation — colors a multi-block selection. Same field-only, id-keyed
 * shape as useSetToggles/useSetDepths (in blockBatchApi); its own file keeps that
 * one under the line gate. Returns a stable callback so callers stay memoized.
 */
export function useSetColors(pageId: string): (ids: string[], color: string) => void {
  const qc = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (updates: { id: string; color: string }[]) =>
      Promise.all(updates.map((u) => pb.collection('blocks').update(u.id, { color: u.color }))),
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: key(pageId) });
      const previous = qc.getQueryData<BlockRecord[]>(key(pageId));
      const byId = new Map(updates.map((u) => [u.id, u.color]));
      qc.setQueryData<BlockRecord[]>(key(pageId), (old) =>
        old?.map((b) => (byId.has(b.id) ? { ...b, color: byId.get(b.id)! } : b)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key(pageId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
  return useCallback((ids, color) => mutate(ids.map((id) => ({ id, color }))), [mutate]);
}
