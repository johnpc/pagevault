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
