/**
 * Blocks server-state via react-query. A block is one line of a page's content;
 * blocks are always scoped to a page and ordered by `sort`.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';
import { nextSort } from '../pages/pageTree';

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

export function useUpdateBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; patch: Partial<BlockRecord> }) =>
      pb.collection('blocks').update<BlockRecord>(input.id, input.patch),
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
