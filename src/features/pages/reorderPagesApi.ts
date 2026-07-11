/**
 * Persist a set of {id, sort} updates from a sidebar drag-reorder. Optimistically
 * patches the cached sort values so the reorder feels instant, then writes each.
 * Split out of pagesApi so each file stays small.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { PageRecord } from '../../lib/pbClient';

const KEY = ['pages'];

export function useReorderPages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; sort: number }[]) =>
      Promise.all(updates.map((u) => pb.collection('pages').update(u.id, { sort: u.sort }))),
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<PageRecord[]>(KEY);
      const bySort = new Map(updates.map((u) => [u.id, u.sort]));
      qc.setQueryData<PageRecord[]>(KEY, (old) =>
        old?.map((p) => (bySort.has(p.id) ? { ...p, sort: bySort.get(p.id)! } : p)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
