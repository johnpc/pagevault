import type PocketBase from 'pocketbase';
import { STARTER_PAGES } from './fixtures/starter';

/**
 * Write the starter pages + their blocks for one owner. Pure of I/O policy —
 * takes an authenticated client and the owner id, so it's unit-testable with a
 * fake client. Returns the number of pages created.
 */
export async function seedWorkspace(pb: PocketBase, owner: string): Promise<number> {
  let pageIndex = 0;
  for (const seedPage of STARTER_PAGES) {
    const page = await pb.collection('pages').create({
      title: seedPage.title,
      icon: seedPage.icon,
      parent: '',
      sort: pageIndex,
      archived: false,
      owner,
    });
    let blockIndex = 0;
    for (const block of seedPage.blocks) {
      await pb.collection('blocks').create({
        page: page.id,
        type: block.type,
        content: block.content,
        checked: block.checked ?? false,
        sort: blockIndex,
        owner,
      });
      blockIndex += 1;
    }
    pageIndex += 1;
  }
  return pageIndex;
}
