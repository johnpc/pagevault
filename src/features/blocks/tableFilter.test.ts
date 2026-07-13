import { describe, it, expect } from 'vitest';
import { visibleRows, setFilter } from './tableFilter';
import type { TableData } from '../../lib/pbTypes';

const grid = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'Name', type: 'text' },
    { name: 'Age', type: 'number' },
    { name: 'Done', type: 'checkbox' },
  ],
  rows: [
    ['Ada', '30', 'true'],
    ['Bob', '25', 'false'],
    ['Cy', '40', 'true'],
  ],
  ...over,
});

describe('visibleRows', () => {
  it('returns every row (with real index) when no filter is set', () => {
    const v = visibleRows(grid());
    expect(v.map((e) => e.index)).toEqual([0, 1, 2]);
  });

  it('filters text case-insensitively by "contains", keeping real indices', () => {
    const v = visibleRows(grid({ filter: { col: 0, query: 'b' } }));
    expect(v).toHaveLength(1);
    expect(v[0].row[0]).toBe('Bob');
    expect(v[0].index).toBe(1); // real index preserved for edits
  });

  it('filters a number column by substring match', () => {
    const v = visibleRows(grid({ filter: { col: 1, query: '4' } }));
    expect(v.map((e) => e.row[0])).toEqual(['Cy']);
  });

  it('filters a checkbox column by true/false', () => {
    expect(visibleRows(grid({ filter: { col: 2, query: 'true' } })).map((e) => e.index)).toEqual([
      0, 2,
    ]);
    expect(visibleRows(grid({ filter: { col: 2, query: 'no' } })).map((e) => e.index)).toEqual([1]);
  });

  it('shows all rows for a blank or out-of-range filter', () => {
    expect(visibleRows(grid({ filter: { col: 0, query: '   ' } }))).toHaveLength(3);
    expect(visibleRows(grid({ filter: { col: 9, query: 'x' } }))).toHaveLength(3);
  });
});

describe('setFilter', () => {
  it('stores a filter with a non-blank query', () => {
    expect(setFilter(grid(), 1, 'foo').filter).toEqual({ col: 1, query: 'foo' });
  });

  it('clears the filter on a blank query', () => {
    const withFilter = grid({ filter: { col: 0, query: 'x' } });
    expect(setFilter(withFilter, 0, '').filter).toBeUndefined();
    expect(setFilter(withFilter, 0, '   ').filter).toBeUndefined();
  });
});
