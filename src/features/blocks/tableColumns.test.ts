import { describe, it, expect } from 'vitest';
import { visibleColumns, toggleColumnHidden } from './tableColumns';
import type { TableData } from '../../lib/pbTypes';

const grid = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'A', type: 'text' },
    { name: 'B', type: 'number' },
    { name: 'C', type: 'text' },
  ],
  rows: [['1', '2', '3']],
  ...over,
});

describe('visibleColumns', () => {
  it('returns all columns with their real index when none hidden', () => {
    expect(visibleColumns(grid()).map((v) => v.index)).toEqual([0, 1, 2]);
  });

  it('skips hidden columns but keeps real indices for the rest', () => {
    const data = grid();
    data.columns[1].hidden = true;
    const v = visibleColumns(data);
    expect(v.map((e) => e.index)).toEqual([0, 2]); // B skipped, C keeps index 2
    expect(v.map((e) => e.column.name)).toEqual(['A', 'C']);
  });
});

describe('toggleColumnHidden', () => {
  it('hides a column (data preserved) and shows it again', () => {
    const hidden = toggleColumnHidden(grid(), 1, true);
    expect(hidden.columns[1].hidden).toBe(true);
    expect(hidden.rows).toEqual([['1', '2', '3']]); // cell data untouched
    const shown = toggleColumnHidden(hidden, 1, false);
    expect(shown.columns[1].hidden).toBeUndefined();
  });

  it('never hides the last visible column', () => {
    let data = grid();
    data = toggleColumnHidden(data, 0, true);
    data = toggleColumnHidden(data, 1, true);
    const before = data;
    data = toggleColumnHidden(data, 2, true); // would blank the table → no-op
    expect(data).toBe(before);
    expect(visibleColumns(data)).toHaveLength(1);
  });

  it('preserves view/filter alongside the column change', () => {
    const data = grid({ view: 'table', filter: { col: 0, query: 'x' } });
    const next = toggleColumnHidden(data, 1, true);
    expect(next.filter).toEqual({ col: 0, query: 'x' });
  });
});
