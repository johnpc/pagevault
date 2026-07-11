import type { PageRecord } from '../../lib/pbClient';
import { displayTitle } from './pageTree';

/** The set of a page's descendant ids (children, grandchildren, …). Pure. */
export function descendantIds(pages: PageRecord[], pageId: string): Set<string> {
  const childrenOf = new Map<string, string[]>();
  for (const p of pages) {
    if (!childrenOf.has(p.parent)) childrenOf.set(p.parent, []);
    childrenOf.get(p.parent)!.push(p.id);
  }
  const out = new Set<string>();
  const stack = [...(childrenOf.get(pageId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    stack.push(...(childrenOf.get(id) ?? []));
  }
  return out;
}

/**
 * Pages a given page may be moved UNDER: any non-archived page except itself
 * and its descendants (moving under a descendant would create a cycle). Pure.
 */
export function validMoveTargets(pages: PageRecord[], pageId: string): PageRecord[] {
  const banned = descendantIds(pages, pageId);
  banned.add(pageId);
  return pages
    .filter((p) => !p.archived && !banned.has(p.id))
    .sort((a, b) => displayTitle(a).localeCompare(displayTitle(b)));
}
