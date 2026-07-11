/**
 * Blocks server-state via react-query. A block is one line of a page's content;
 * blocks are always scoped to a page and ordered by `sort`.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';
import { nextSort } from '../pages/pageTree';
import { cloneFields, insertAfterUpdates } from './reorder';

const key = (pageId: string) => ['blocks', pageId];

export function useBlocks(pageId: string | undefined) {
  return useQuery({
    queryKey: key(pageId ?? ''),
    enabled: !!pageId,
    queryFn: () =>
      pb
        .collection('blocks')
        .getFullList<BlockRecord>({ filter: `page = '${pageId}'`, sort: 'sort' }),
  });
}

export function useCreateBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { type: BlockType; content: string; siblings: BlockRecord[] }) =>
      pb.collection('blocks').create<BlockRecord>({
        page: pageId,
        type: input.type,
        content: input.content,
        sort: nextSort(input.siblings),
        owner: currentUserId(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}

export function useDeleteBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pb.collection('blocks').delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}

/**
 * Duplicate a block: create a copy (appended), then reorder it to sit directly
 * below the source. `blocks` is the current ordered list. Returns nothing.
 */
export function useDuplicateBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { source: BlockRecord; blocks: BlockRecord[] }) => {
      const created = await pb.collection('blocks').create<BlockRecord>({
        page: pageId,
        ...cloneFields(input.source),
        sort: nextSort(input.blocks),
        owner: currentUserId(),
      });
      const updates = insertAfterUpdates([...input.blocks, created], created, input.source.id);
      await Promise.all(updates.map((u) => pb.collection('blocks').update(u.id, { sort: u.sort })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(pageId) }),
  });
}

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
