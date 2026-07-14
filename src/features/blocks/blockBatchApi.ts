/**
 * Batch block mutations that write many rows at once with an optimistic cache
 * update: reordering (sort) and collapse/expand-all (collapsed). Split from
 * blocksApi so each file stays small. Both are field/order writes with a single
 * settle refetch and rollback-on-error.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';

const key = (pageId: string) => ['blocks', pageId];

/**
 * Persist a reordered block list. Optimistically writes the new order to the
 * cache so the drag feels instant, then patches only the changed `sort`s. On
 * error it restores the previous order and refetches.
 */
export function useReorderBlocks(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { reordered: BlockRecord[]; updates: { id: string; sort: number }[] }) =>
      Promise.all(input.updates.map((u) => pb.collection('blocks').update(u.id, { sort: u.sort }))),
    onMutate: async ({ reordered }) => {
      await qc.cancelQueries({ queryKey: key(pageId) });
      const previous = qc.getQueryData<BlockRecord[]>(key(pageId));
      qc.setQueryData(key(pageId), reordered);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key(pageId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}

/**
 * Set many blocks' `collapsed` state in one batch (collapse/expand all toggles).
 * Field-only + keyed by id — no positional reconcile — so the optimistic write
 * just maps the given ids; one settle refetch. Rolls back on error.
 */
export function useSetToggles(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; collapsed: boolean }[]) =>
      Promise.all(
        updates.map((u) => pb.collection('blocks').update(u.id, { collapsed: u.collapsed })),
      ),
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: key(pageId) });
      const previous = qc.getQueryData<BlockRecord[]>(key(pageId));
      const byId = new Map(updates.map((u) => [u.id, u.collapsed]));
      qc.setQueryData<BlockRecord[]>(key(pageId), (old) =>
        old?.map((b) => (byId.has(b.id) ? { ...b, collapsed: byId.get(b.id)! } : b)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key(pageId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}

/**
 * Set many blocks' `depth` in one batch (indent/outdent a multi-block
 * selection). Same field-only, id-keyed optimistic shape as useSetToggles.
 */
export function useSetDepths(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { id: string; depth: number }[]) =>
      Promise.all(updates.map((u) => pb.collection('blocks').update(u.id, { depth: u.depth }))),
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: key(pageId) });
      const previous = qc.getQueryData<BlockRecord[]>(key(pageId));
      const byId = new Map(updates.map((u) => [u.id, u.depth]));
      qc.setQueryData<BlockRecord[]>(key(pageId), (old) =>
        old?.map((b) => (byId.has(b.id) ? { ...b, depth: byId.get(b.id)! } : b)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(key(pageId), ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}
