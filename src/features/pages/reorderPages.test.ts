import { describe, it, expect } from 'vitest';
import { reorderSiblings } from './reorderPages';
import type { PageRecord } from '../../lib/pbClient';

const p = (id: string, sort: number, parent = ''): PageRecord =>
  ({ id, sort, parent, title: id }) as unknown as PageRecord;

describe('reorderSiblings', () => {
  it('moves a page to sit before its target among the same parent', () => {
    const pages = [p('a', 0), p('b', 1), p('c', 2)];
    // Drag c before a → order c,a,b.
    const updates = reorderSiblings(pages, 'c', 'a');
    expect(updates).toEqual([
      { id: 'c', sort: 0 },
      { id: 'a', sort: 1 },
      { id: 'b', sort: 2 },
    ]);
  });

  it('only writes the entries whose sort actually changed', () => {
    const pages = [p('a', 0), p('b', 1), p('c', 2)];
    // Drag b before a → order b,a,c. b and a swap; c is unchanged (no write).
    const updates = reorderSiblings(pages, 'b', 'a');
    expect(updates).toEqual([
      { id: 'b', sort: 0 },
      { id: 'a', sort: 1 },
    ]);
  });

  it('is a no-op when the drag would not change the order (drop just after self)', () => {
    const pages = [p('a', 0), p('b', 1), p('c', 2)];
    // Drag a before b — a is already immediately before b, so nothing changes.
    expect(reorderSiblings(pages, 'a', 'b')).toEqual([]);
  });

  it('is a no-op when dropping onto itself', () => {
    expect(reorderSiblings([p('a', 0), p('b', 1)], 'a', 'a')).toEqual([]);
  });

  it('does not reorder across different parents (reparenting stays elsewhere)', () => {
    const pages = [p('a', 0, 'root'), p('b', 0, 'other')];
    expect(reorderSiblings(pages, 'a', 'b')).toEqual([]);
  });

  it('reorders within a nested branch, ignoring pages in other branches', () => {
    const pages = [p('x', 0, 'P'), p('y', 1, 'P'), p('z', 0, 'other')];
    const updates = reorderSiblings(pages, 'y', 'x');
    expect(updates).toEqual([
      { id: 'y', sort: 0 },
      { id: 'x', sort: 1 },
    ]);
  });
});
