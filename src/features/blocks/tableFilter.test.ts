import { describe, it, expect } from 'vitest';
import {
  visibleRows,
  conditions,
  addCondition,
  updateCondition,
  removeCondition,
} from './tableFilter';
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

describe('multi-condition filters (AND)', () => {
  it('applies all active conditions — a row must match every one', () => {
    // Age contains "0" AND Done is checked → Ada(30,true) and Cy(40,true).
    const data = grid({
      filters: [
        { col: 1, query: '0' },
        { col: 2, query: 'true' },
      ],
    });
    expect(visibleRows(data).map((e) => e.row[0])).toEqual(['Ada', 'Cy']);
  });

  it('ignores blank/editing conditions when matching', () => {
    const data = grid({
      filters: [
        { col: 0, query: 'a' },
        { col: 1, query: '' },
      ],
    });
    // Only the non-blank Name~"a" applies → Ada.
    expect(visibleRows(data).map((e) => e.row[0])).toEqual(['Ada']);
  });

  it('migrates a legacy single filter via conditions()', () => {
    expect(conditions(grid({ filter: { col: 0, query: 'x' } }))).toEqual([{ col: 0, query: 'x' }]);
  });

  it('add/update/remove edit the condition list (blanks kept for editing)', () => {
    let d = addCondition(grid(), 1);
    expect(conditions(d)).toEqual([{ col: 1, query: '' }]);
    d = updateCondition(d, 0, { query: 'foo' });
    expect(conditions(d)).toEqual([{ col: 1, query: 'foo' }]);
    d = removeCondition(d, 0);
    expect(conditions(d)).toEqual([]);
    expect(d.filters).toBeUndefined();
  });
});

describe('visibleRows with relations', () => {
  it('filters a relation column by the linked page title', () => {
    const data = {
      columns: [{ name: 'Page', type: 'relation' as const }],
      rows: [['p1'], ['p2'], ['']],
      filter: { col: 0, query: 'road' },
    };
    const titles = { p1: 'Roadmap', p2: 'Journal' };
    const v = visibleRows(data, titles);
    expect(v).toHaveLength(1);
    expect(v[0].row[0]).toBe('p1'); // matched by title "Roadmap", keeps id
  });
});
