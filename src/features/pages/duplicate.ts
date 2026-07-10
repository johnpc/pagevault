import { pb, currentUserId } from '../../lib/pbClient';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { displayTitle, nextSort } from './pageTree';

/** The new page's fields when duplicating `source` among `siblings`. Pure. */
export function duplicatePageFields(source: PageRecord, siblings: PageRecord[], owner: string) {
  return {
    title: `${displayTitle(source)} (copy)`,
    icon: source.icon,
    parent: source.parent,
    favorite: false,
    archived: false,
    sort: nextSort(siblings),
    owner,
  };
}

/** The block payloads to recreate `blocks` under a new page id, order preserved. */
export function duplicateBlockFields(blocks: BlockRecord[], newPageId: string, owner: string) {
  return blocks
    .slice()
    .sort((a, b) => a.sort - b.sort)
    .map((block, index) => ({
      page: newPageId,
      type: block.type,
      content: block.content,
      checked: block.checked,
      sort: index,
      owner,
    }));
}

/** Create a sibling copy of `source` and clone its blocks. Returns the new id. */
export async function runDuplicate(input: {
  source: PageRecord;
  blocks: BlockRecord[];
  siblings: PageRecord[];
}): Promise<string> {
  const owner = currentUserId();
  const copy = await pb
    .collection('pages')
    .create<PageRecord>(duplicatePageFields(input.source, input.siblings, owner));
  await Promise.all(
    duplicateBlockFields(input.blocks, copy.id, owner).map((b) =>
      pb.collection('blocks').create(b),
    ),
  );
  return copy.id;
}
