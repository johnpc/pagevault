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

/** Delete one block or several at once (a multi-block selection). One cache
 * invalidation after all deletes settle. */
export function useDeleteBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | string[]) =>
      Promise.all(
        (Array.isArray(id) ? id : [id]).map((one) => pb.collection('blocks').delete(one)),
      ),
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
