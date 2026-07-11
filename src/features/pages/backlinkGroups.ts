import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { displayTitle } from './pageTree';

/** The distinctive substring of a mention token that links `pageId`: the
 * `](pageId)` tail of `@[Title](pageId)`. Used to find backlinking blocks. Pure. */
export function mentionMarker(pageId: string): string {
  return `](${pageId})`;
}

/** A page that links to the current one, with the linking blocks' text. */
export interface Backlink {
  page: PageRecord;
  snippets: string[]; // the content of each block on that page that mentions us
}

/**
 * Group blocks that mention `targetId` by their source page, dropping any on the
 * target page itself (a self-mention isn't a backlink) and any whose page is
 * unknown/archived. Ordered by page title. Pure — unit-testable.
 */
export function buildBacklinks(
  targetId: string,
  blocks: BlockRecord[],
  pagesById: Map<string, PageRecord>,
): Backlink[] {
  const byPage = new Map<string, Backlink>();
  for (const block of blocks) {
    if (block.page === targetId) continue;
    const page = pagesById.get(block.page);
    if (!page || page.archived) continue;
    const entry = byPage.get(page.id) ?? { page, snippets: [] };
    entry.snippets.push(block.content);
    byPage.set(page.id, entry);
  }
  return [...byPage.values()].sort((a, b) =>
    displayTitle(a.page).localeCompare(displayTitle(b.page)),
  );
}
