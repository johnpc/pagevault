/**
 * Pure helpers for turning the flat list of pages from PocketBase into the
 * nested sidebar tree, and for ordering. No I/O — trivially unit-testable.
 */
import type { PageRecord } from '../../lib/pbClient';

export interface PageNode {
  page: PageRecord;
  children: PageNode[];
}

/** Build a nested tree from a flat page list, ordered by `sort` then title. */
export function buildTree(pages: PageRecord[]): PageNode[] {
  const byId = new Map<string, PageNode>();
  for (const page of pages) byId.set(page.id, { page, children: [] });

  const roots: PageNode[] = [];
  for (const node of byId.values()) {
    const parent = node.page.parent ? byId.get(node.page.parent) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  sortNodes(roots);
  return roots;
}

/** Recursively sort a node list (and their children) by sort asc, then title. */
export function sortNodes(nodes: PageNode[]): void {
  nodes.sort((a, b) => a.page.sort - b.page.sort || a.page.title.localeCompare(b.page.title));
  for (const node of nodes) sortNodes(node.children);
}

/** The next sort value = one past the current max (append to the end). */
export function nextSort(items: { sort: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.sort), -1) + 1;
}

/** A human title for a page — falls back to "Untitled" when the title is blank. */
export function displayTitle(page: Pick<PageRecord, 'title'>): string {
  return page.title.trim() || 'Untitled';
}

/** The favorited pages, ordered by title. Pure — for the sidebar's Favorites
 * section. */
export function favoritePages(pages: PageRecord[]): PageRecord[] {
  return pages
    .filter((p) => p.favorite)
    .sort((a, b) => displayTitle(a).localeCompare(displayTitle(b)));
}

/** The most-recently-edited pages (newest first), capped at `limit`. Pure —
 * powers the Home screen's "recently edited" grid. */
export function recentPages(pages: PageRecord[], limit = 6): PageRecord[] {
  return pages
    .filter((p) => !p.archived)
    .slice()
    .sort((a, b) => (a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0))
    .slice(0, limit);
}

/**
 * The ancestor path for a page, root-first and INCLUDING the page itself, by
 * walking the `parent` chain. Guards against cycles/missing parents so a
 * corrupt link can't loop forever. Pure — unit-testable.
 */
export function ancestorPath(pages: PageRecord[], pageId: string): PageRecord[] {
  const byId = new Map(pages.map((p) => [p.id, p]));
  const path: PageRecord[] = [];
  const seen = new Set<string>();
  let current = byId.get(pageId);
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current = current.parent ? byId.get(current.parent) : undefined;
  }
  return path;
}
