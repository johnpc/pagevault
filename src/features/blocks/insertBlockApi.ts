/**
 * Insert a fresh empty text block directly BELOW a given block (the "+" gutter
 * affordance — Notion's add-block-here), then re-sort so it lands right after
 * the source rather than at the page end. Mirrors useDuplicateBlock's flow.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';
import { nextSort } from '../pages/pageTree';
import { insertAfterUpdates } from './reorder';

export function useInsertBlockAfter(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { source: BlockRecord; blocks: BlockRecord[] }) => {
      const created = await pb.collection('blocks').create<BlockRecord>({
        page: pageId,
        type: 'text',
        content: '',
        checked: false,
        depth: input.source.depth ?? 0,
        sort: nextSort(input.blocks),
        owner: currentUserId(),
      });
      const updates = insertAfterUpdates([...input.blocks, created], created, input.source.id);
      await Promise.all(updates.map((u) => pb.collection('blocks').update(u.id, { sort: u.sort })));
      return created;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks', pageId] }),
  });
}
