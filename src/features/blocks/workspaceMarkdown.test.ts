import { describe, it, expect } from 'vitest';
import { workspaceMarkdown, pagesInTreeOrder } from './workspaceMarkdown';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';

const pg = (id: string, title: string, over: Partial<PageRecord> = {}): PageRecord =>
  ({ id, title, icon: '', parent: '', sort: 0, archived: false, ...over }) as PageRecord;
const blk = (page: string, type: string, content: string): BlockRecord =>
  ({ page, type, content }) as BlockRecord;

describe('pagesInTreeOrder', () => {
  it('walks parents before their children, depth-first', () => {
    const pages = [
      pg('child', 'Child', { parent: 'root', sort: 0 }),
      pg('root', 'Root', { sort: 0 }),
      pg('root2', 'Root 2', { sort: 1 }),
    ];
    expect(pagesInTreeOrder(pages).map((p) => p.id)).toEqual(['root', 'child', 'root2']);
  });
});

describe('workspaceMarkdown', () => {
  it('joins every page (tree order) separated by a rule', () => {
    const pages = [pg('a', 'Alpha', { sort: 0 }), pg('b', 'Bravo', { sort: 1 })];
    const byPage = new Map([
      ['a', [blk('a', 'text', 'first')]],
      ['b', [blk('b', 'heading', 'B head')]],
    ]);
    const md = workspaceMarkdown(pages, byPage);
    // Each page: heading, blank, then its lines (pageToMarkdown joins with \n\n);
    // pages are separated by a horizontal rule.
    expect(md).toBe('# Alpha\n\n\n\nfirst\n\n---\n\n# Bravo\n\n\n\n# B head');
  });

  it('omits archived pages', () => {
    const pages = [pg('a', 'Alpha'), pg('z', 'Gone', { archived: true })];
    const md = workspaceMarkdown(pages, new Map());
    expect(md).toContain('# Alpha');
    expect(md).not.toContain('Gone');
  });

  it('handles a page with no blocks', () => {
    expect(workspaceMarkdown([pg('a', 'Empty')], new Map())).toBe('# Empty\n\n');
  });
});
