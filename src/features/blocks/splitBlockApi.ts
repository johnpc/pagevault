/**
 * Split a block at the caret: trim the source to the pre-caret text and insert a
 * new block directly BELOW it carrying the post-caret text — the Notion "press
 * Enter to continue on the next line" behavior (not an append to the page end).
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, currentUserId } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';
import { nextSort } from '../pages/pageTree';
import { insertAfterUpdates } from './reorder';

export interface SplitInput {
  source: BlockRecord;
  before: string;
  after: string;
  type: BlockType;
  depth: number;
  blocks: BlockRecord[];
}

export function useSplitBlock(pageId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SplitInput) => {
      await pb.collection('blocks').update(input.source.id, { content: input.before });
      const created = await pb.collection('blocks').create<BlockRecord>({
        page: pageId,
        type: input.type,
        content: input.after,
        checked: false,
        depth: input.depth,
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
