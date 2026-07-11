/**
 * Bulk-import parsed markdown blocks into a page. Replaces the (usually empty)
 * target block with the parsed blocks, appended in order at the end of the page.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';
import { nextSort } from '../pages/pageTree';
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
      const remaining = input.blocks.filter((b) => b.id !== input.target.id);
      let sort = nextSort(remaining);
      // Delete the target (the block the user pasted into) then append the parsed
      // blocks in order.
      await pb.collection('blocks').delete(input.target.id);
      for (const p of input.parsed) {
        await pb.collection('blocks').create({
          page: pageId,
          type: p.type,
          content: p.content,
          checked: false,
          depth: 0,
          sort: sort++,
          owner,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blocks', pageId] }),
  });
}
