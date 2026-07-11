import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { displayTitle } from '../pages/pageTree';
import { titleRank } from './highlight';

/** A single quick-find hit: always resolves to a page to open. */
export interface SearchResult {
  pageId: string;
  title: string;
  icon: string;
  snippet: string; // '' for a pure title match
  kind: 'title' | 'block';
}

/**
 * The next active index for a list of `count` items given an arrow key ('up' or
 * 'down'), wrapping around. Returns `current` unchanged for an empty list. Pure.
 */
export function nextActiveIndex(current: number, count: number, dir: 'up' | 'down'): number {
  if (count === 0) return current;
  const step = dir === 'down' ? 1 : -1;
  return (current + step + count) % count;
}

/** A short context snippet around the first match of `query` in `text`. */
export function snippetAround(text: string, query: string, radius = 30): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

/**
 * Merge title-matched pages and content-matched blocks into ranked, de-duped
 * page-level results: title matches first, then one block match per page (the
 * page isn't already a title hit). Pure — no I/O.
 */
export function mergeResults(
  query: string,
  pages: PageRecord[],
  blocks: BlockRecord[],
  pageById: Map<string, PageRecord>,
): SearchResult[] {
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  // Title matches first, ranked exact → prefix → word-start → substring (stable
  // within a rank by the incoming order), so the best title lands at the top.
  const rankedPages = pages
    .map((page, i) => ({ page, i, rank: titleRank(displayTitle(page), query) }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i);
  for (const { page } of rankedPages) {
    seen.add(page.id);
    results.push({
      pageId: page.id,
      title: displayTitle(page),
      icon: page.icon || '📄',
      snippet: '',
      kind: 'title',
    });
  }

  for (const block of blocks) {
    if (seen.has(block.page)) continue;
    const page = pageById.get(block.page);
    if (!page || page.archived) continue;
    seen.add(block.page);
    results.push({
      pageId: block.page,
      title: displayTitle(page),
      icon: page.icon || '📄',
      snippet: snippetAround(block.content, query),
      kind: 'block',
    });
  }

  return results;
}
