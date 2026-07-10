import { describe, it, expect } from 'vitest';
import {
  buildTree,
  nextSort,
  displayTitle,
  sortNodes,
  ancestorPath,
  favoritePages,
  recentPages,
  type PageNode,
} from './pageTree';
import type { PageRecord } from '../../lib/pbClient';

const mk = (id: string, over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id,
    title: id,
    icon: '',
    archived: false,
    sort: 0,
    parent: '',
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'pages',
    ...over,
  }) as PageRecord;

describe('buildTree', () => {
  it('nests children under their parent', () => {
    const tree = buildTree([mk('a'), mk('b', { parent: 'a' }), mk('c', { parent: 'a' })]);
    expect(tree).toHaveLength(1);
    expect(tree[0].page.id).toBe('a');
    expect(tree[0].children.map((n) => n.page.id)).toEqual(['b', 'c']);
  });

  it('orders siblings by sort then title', () => {
    const tree = buildTree([mk('z', { sort: 0 }), mk('a', { sort: 0 }), mk('m', { sort: -1 })]);
    expect(tree.map((n) => n.page.id)).toEqual(['m', 'a', 'z']);
  });

  it('treats a page whose parent is missing as a root', () => {
    const tree = buildTree([mk('orphan', { parent: 'gone' })]);
    expect(tree.map((n) => n.page.id)).toEqual(['orphan']);
  });
});

describe('sortNodes', () => {
  it('sorts nested children too', () => {
    const nodes: PageNode[] = [
      {
        page: mk('a'),
        children: [
          { page: mk('y', { sort: 1 }), children: [] },
          { page: mk('x', { sort: 0 }), children: [] },
        ],
      },
    ];
    sortNodes(nodes);
    expect(nodes[0].children.map((n) => n.page.id)).toEqual(['x', 'y']);
  });
});

describe('nextSort', () => {
  it('returns 0 for an empty list', () => {
    expect(nextSort([])).toBe(0);
  });
  it('returns one past the max sort', () => {
    expect(nextSort([{ sort: 2 }, { sort: 5 }, { sort: 1 }])).toBe(6);
  });
});

describe('displayTitle', () => {
  it('falls back to Untitled for blank titles', () => {
    expect(displayTitle({ title: '   ' })).toBe('Untitled');
    expect(displayTitle({ title: 'Roadmap' })).toBe('Roadmap');
  });
});

describe('favoritePages', () => {
  it('returns only favorites, ordered by title', () => {
    const pages = [
      mk('z', { title: 'Zebra', favorite: true }),
      mk('a', { title: 'Apple', favorite: true }),
      mk('n', { title: 'Nope', favorite: false }),
    ];
    expect(favoritePages(pages).map((p) => p.id)).toEqual(['a', 'z']);
  });
  it('returns empty when nothing is favorited', () => {
    expect(favoritePages([mk('a')])).toEqual([]);
  });
});

describe('recentPages', () => {
  const pages = [
    mk('old', { updated: '2026-01-01T00:00:00Z' }),
    mk('new', { updated: '2026-03-01T00:00:00Z' }),
    mk('mid', { updated: '2026-02-01T00:00:00Z' }),
    mk('arch', { updated: '2026-04-01T00:00:00Z', archived: true }),
  ];
  it('orders by updated desc and excludes archived', () => {
    expect(recentPages(pages).map((p) => p.id)).toEqual(['new', 'mid', 'old']);
  });
  it('respects the limit', () => {
    expect(recentPages(pages, 1).map((p) => p.id)).toEqual(['new']);
  });
});

describe('ancestorPath', () => {
  const pages = [
    mk('a'),
    mk('b', { parent: 'a' }),
    mk('c', { parent: 'b' }),
    mk('orphan', { parent: 'gone' }),
  ];

  it('returns the root-first path including the page itself', () => {
    expect(ancestorPath(pages, 'c').map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('returns just the page for a top-level page', () => {
    expect(ancestorPath(pages, 'a').map((p) => p.id)).toEqual(['a']);
  });

  it('stops at a missing parent', () => {
    expect(ancestorPath(pages, 'orphan').map((p) => p.id)).toEqual(['orphan']);
  });

  it('is empty for an unknown id', () => {
    expect(ancestorPath(pages, 'nope')).toEqual([]);
  });

  it('does not loop on a cycle', () => {
    const cyclic = [mk('x', { parent: 'y' }), mk('y', { parent: 'x' })];
    expect(ancestorPath(cyclic, 'x').length).toBeLessThanOrEqual(2);
  });
});
