import { describe, it, expect } from 'vitest';
import { buildTree, nextSort, displayTitle, sortNodes, type PageNode } from './pageTree';
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
