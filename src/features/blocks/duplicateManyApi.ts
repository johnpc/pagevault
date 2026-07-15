/**
 * Duplicate a whole block selection (Notion's Cmd/Ctrl+D on selected blocks):
 * clone each selected block — preserving depth/color/align/etc. — as a contiguous
 * run inserted directly below the LAST selected block, keeping their order.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';
import { nextSort } from '../pages/pageTree';
import { fullCloneFields, insertRunAfterUpdates } from './reorder';

export function useDuplicateMany(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { sources: BlockRecord[]; blocks: BlockRecord[] }) => {
      const { sources, blocks } = input;
      if (sources.length === 0) return;
      // Create clones in order; each gets a provisional end-of-page sort, fixed
      // up below. Sequential (not Promise.all) so their created order is stable.
      const clones: BlockRecord[] = [];
      for (const source of sources) {
        clones.push(
          await pb.collection('blocks').create<BlockRecord>({
            page: pageId,
            ...fullCloneFields(source),
            sort: nextSort([...blocks, ...clones]),
            owner: currentUserId(),
          }),
        );
      }
      const afterId = sources[sources.length - 1].id;
      const updates = insertRunAfterUpdates([...blocks, ...clones], clones, afterId);
      await Promise.all(updates.map((u) => pb.collection('blocks').update(u.id, { sort: u.sort })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks', pageId] }),
  });
}
