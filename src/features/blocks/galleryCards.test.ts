import { describe, it, expect } from 'vitest';
import { galleryCards } from './galleryCards';
import type { TableData } from '../../lib/pbTypes';

const data = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Status', type: 'select', options: ['Todo', 'Done'] },
    { name: 'Owner', type: 'relation' },
  ],
  rows: [
    ['Write', 'Todo', 'p1'],
    ['Ship', 'Done', ''],
  ],
  ...over,
});

describe('galleryCards', () => {
  it('makes one card per row, first visible column as the title', () => {
    const cards = galleryCards(data());
    expect(cards).toHaveLength(2);
    expect(cards[0].title).toBe('Write');
    expect(cards[0].titleCol).toBe(0);
    expect(cards[0].row).toBe(0);
  });

  it('renders the remaining visible columns as label/value fields', () => {
    const cards = galleryCards(data());
    expect(cards[0].fields.map((f) => f.label)).toEqual(['Status', 'Owner']);
    expect(cards[0].fields[0].value).toBe('Todo');
    // Carries the column type so the view can render select values as pills.
    expect(cards[0].fields.map((f) => f.type)).toEqual(['select', 'relation']);
  });

  it('resolves relation fields to the linked page title', () => {
    const cards = galleryCards(data(), { p1: 'Alice' });
    expect(cards[0].fields[1].value).toBe('Alice');
    // Unlinked relation resolves to empty.
    expect(cards[1].fields[1].value).toBe('');
  });

  it('preserves the real row index under a filter so edits target the right row', () => {
    const cards = galleryCards(data({ filters: [{ col: 1, query: 'Done' }] }));
    expect(cards).toHaveLength(1);
    expect(cards[0].title).toBe('Ship');
    expect(cards[0].row).toBe(1); // real index, not 0
  });

  it('skips hidden columns (a hidden title column shifts the title to the next)', () => {
    const cards = galleryCards(data({ columns: [{ name: 'Task', type: 'text', hidden: true }] }));
    // Only the hidden Task column exists → no visible columns → empty title.
    expect(cards[0].titleCol).toBe(-1);
    expect(cards[0].title).toBe('');
    expect(cards[0].fields).toHaveLength(0);
  });

  it('a table with no columns yields cards with no title column and no fields', () => {
    const cards = galleryCards({ columns: [], rows: [[]] });
    expect(cards[0].titleCol).toBe(-1);
    expect(cards[0].fields).toEqual([]);
  });
});
