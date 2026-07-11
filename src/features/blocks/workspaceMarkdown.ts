import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { buildTree, type PageNode } from '../pages/pageTree';
import { pageToMarkdown } from './exportMarkdown';

/** The pages in sidebar-tree order (depth-first), so an export reads top-down
 * the way the workspace is arranged. Pure. */
export function pagesInTreeOrder(pages: PageRecord[]): PageRecord[] {
  const out: PageRecord[] = [];
  const walk = (nodes: PageNode[]) => {
    for (const n of nodes) {
      out.push(n.page);
      walk(n.children);
    }
  };
  walk(buildTree(pages));
  return out;
}

/**
 * Serialize the whole workspace to one Markdown document: every non-archived
 * page (in tree order) rendered via pageToMarkdown, separated by a horizontal
 * rule. `blocksByPage` maps a page id to its ordered blocks. Pure — unit-tested.
 */
export function workspaceMarkdown(
  pages: PageRecord[],
  blocksByPage: Map<string, BlockRecord[]>,
): string {
  const docs = pagesInTreeOrder(pages)
    .filter((p) => !p.archived)
    .map((p) => pageToMarkdown(p, blocksByPage.get(p.id) ?? []));
  return docs.join('\n\n---\n\n');
}
