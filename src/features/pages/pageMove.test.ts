import { describe, it, expect } from 'vitest';
import { descendantIds, validMoveTargets } from './pageMove';
import type { PageRecord } from '../../lib/pbClient';

const mk = (id: string, over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id,
    title: id,
    icon: '',
    archived: false,
    favorite: false,
    cover: '',
    sort: 0,
    parent: '',
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'pages',
    ...over,
  }) as PageRecord;

// a > b > c ; d separate
const pages = [mk('a'), mk('b', { parent: 'a' }), mk('c', { parent: 'b' }), mk('d')];

describe('descendantIds', () => {
  it('collects the whole subtree', () => {
    expect([...descendantIds(pages, 'a')].sort()).toEqual(['b', 'c']);
    expect([...descendantIds(pages, 'c')]).toEqual([]);
  });
});

describe('validMoveTargets', () => {
  it('excludes self and descendants', () => {
    expect(validMoveTargets(pages, 'a').map((p) => p.id)).toEqual(['d']);
  });
  it('allows moving a leaf anywhere but itself', () => {
    expect(
      validMoveTargets(pages, 'c')
        .map((p) => p.id)
        .sort(),
    ).toEqual(['a', 'b', 'd']);
  });
  it('excludes archived pages as targets', () => {
    const withArchived = [...pages, mk('e', { archived: true })];
    expect(validMoveTargets(withArchived, 'd').map((p) => p.id)).not.toContain('e');
  });
});
