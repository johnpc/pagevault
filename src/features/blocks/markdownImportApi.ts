/**
 * Bulk-import parsed markdown blocks into a page. Replaces the target block (the
 * one pasted into) with the parsed blocks IN PLACE — they land at the target's
 * position, not the page end — so pasting copied blocks reflows correctly.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';
import { nextSort } from '../pages/pageTree';
import { sortUpdates } from './reorder';
import type { ParsedBlock } from './markdownImport';

export function useImportMarkdown(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      target: BlockRecord;
      parsed: ParsedBlock[];
      blocks: BlockRecord[];
    }) => {
      const owner = currentUserId();
      const targetIdx = input.blocks.findIndex((b) => b.id === input.target.id);
      let sort = nextSort(input.blocks);
      // Delete the target, then create the parsed blocks (provisional end-of-page
      // sorts, fixed up below to sit where the target was).
      await pb.collection('blocks').delete(input.target.id);
      const created: BlockRecord[] = [];
      for (const p of input.parsed) {
        created.push(
          await pb.collection('blocks').create<BlockRecord>({
            page: pageId,
            type: p.type,
            content: p.content,
            checked: false,
            depth: p.depth ?? 0,
            lang: p.lang ?? '',
            sort: sort++,
            owner,
          }),
        );
      }
      // Re-sort: drop the created run into the target's old slot.
      const ordered = input.blocks.filter((b) => b.id !== input.target.id);
      ordered.splice(Math.max(0, targetIdx), 0, ...created);
      const updates = sortUpdates(ordered);
      await Promise.all(updates.map((u) => pb.collection('blocks').update(u.id, { sort: u.sort })));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks', pageId] }),
  });
}
