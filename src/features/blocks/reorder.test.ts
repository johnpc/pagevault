import { describe, it, expect } from 'vitest';
import { moveBlock, sortUpdates, cloneFields, insertAfterUpdates } from './reorder';
import type { BlockRecord } from '../../lib/pbClient';

const mk = (id: string, sort: number): BlockRecord =>
  ({
    id,
    sort,
    page: 'p1',
    type: 'text',
    content: id,
    checked: false,
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
  }) as BlockRecord;

const list = () => [mk('a', 0), mk('b', 1), mk('c', 2), mk('d', 3)];

describe('moveBlock', () => {
  it('moves a block up to another block’s position', () => {
    expect(moveBlock(list(), 'd', 'b').map((b) => b.id)).toEqual(['a', 'd', 'b', 'c']);
  });
  it('moves a block down', () => {
    expect(moveBlock(list(), 'a', 'c').map((b) => b.id)).toEqual(['b', 'c', 'a', 'd']);
  });
  it('is a no-op when source and target are the same', () => {
    expect(moveBlock(list(), 'b', 'b').map((b) => b.id)).toEqual(['a', 'b', 'c', 'd']);
  });
  it('is a no-op when an id is missing', () => {
    expect(moveBlock(list(), 'x', 'b').map((b) => b.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(moveBlock(list(), 'a', 'z').map((b) => b.id)).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('sortUpdates', () => {
  it('returns only the blocks whose sort changed', () => {
    const reordered = moveBlock(list(), 'd', 'b'); // a,d,b,c
    // indexes: a=0(unchanged), d=1(was3), b=2(was1), c=3(was2)
    expect(sortUpdates(reordered)).toEqual([
      { id: 'd', sort: 1 },
      { id: 'b', sort: 2 },
      { id: 'c', sort: 3 },
    ]);
  });
  it('returns nothing when order is already sequential', () => {
    expect(sortUpdates(list())).toEqual([]);
  });
});

describe('cloneFields', () => {
  it('copies type, content and checked only', () => {
    expect(cloneFields(mk('a', 3))).toEqual({ type: 'text', content: 'a', checked: false });
  });
});

describe('insertAfterUpdates', () => {
  it('places a clone directly after its source', () => {
    const clone = mk('clone', 4);
    const withClone = [...list(), clone]; // a,b,c,d,clone
    // Insert clone after 'b' → a,b,clone,c,d
    const updates = insertAfterUpdates(withClone, clone, 'b');
    expect(updates).toEqual([
      { id: 'clone', sort: 2 },
      { id: 'c', sort: 3 },
      { id: 'd', sort: 4 },
    ]);
  });
});
