import { describe, it, expect } from 'vitest';
import { visibleColumns, toggleColumnHidden, moveColumn } from './tableColumns';
import { setColumnFormat, setColumnSummary } from './tableColumnFields';
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

describe('moveColumn', () => {
  it('moves a column header and every row cell to the new index', () => {
    const next = moveColumn(grid(), 0, 2); // A after C
    expect(next.columns.map((c) => c.name)).toEqual(['B', 'C', 'A']);
    expect(next.rows[0]).toEqual(['2', '3', '1']);
  });

  it('moves right-to-left too', () => {
    const next = moveColumn(grid(), 2, 0); // C to front
    expect(next.columns.map((c) => c.name)).toEqual(['C', 'A', 'B']);
    expect(next.rows[0]).toEqual(['3', '1', '2']);
  });

  it('no-ops on same/out-of-range index', () => {
    const g = grid();
    expect(moveColumn(g, 1, 1)).toBe(g);
    expect(moveColumn(g, 0, 9)).toBe(g);
  });

  it('remaps a stored filter.col so it follows its column', () => {
    // filter targets column B (index 1); moving A→end shifts B to index 0.
    const g = grid({ filter: { col: 1, query: 'x' } });
    expect(moveColumn(g, 0, 2).filter).toEqual({ col: 0, query: 'x' });
  });

  it('remaps groupBy through the move', () => {
    const g = grid({ groupBy: 2 }); // group by C
    // move C (2) to front → its new index is 0.
    expect(moveColumn(g, 2, 0).groupBy).toBe(0);
  });
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

describe('setColumnFormat', () => {
  it('sets a number format and clears it for plain/empty', () => {
    expect(setColumnFormat(grid(), 1, 'usd').columns[1].format).toBe('usd');
    const withFmt = setColumnFormat(grid(), 1, 'comma');
    expect(setColumnFormat(withFmt, 1, 'plain').columns[1].format).toBeUndefined();
    expect(setColumnFormat(withFmt, 1, '').columns[1].format).toBeUndefined();
  });

  it('preserves other column fields (name, hidden, summary)', () => {
    const data = grid();
    data.columns[1] = { name: 'B', type: 'number', hidden: true, summary: 'sum' };
    const next = setColumnFormat(data, 1, 'eur');
    expect(next.columns[1]).toEqual({
      name: 'B',
      type: 'number',
      hidden: true,
      summary: 'sum',
      format: 'eur',
    });
  });
});

describe('setColumnSummary', () => {
  it('sets a summary and preserves format/hidden', () => {
    const data = grid();
    data.columns[1] = { name: 'B', type: 'number', format: 'usd', hidden: true };
    const next = setColumnSummary(data, 1, 'sum');
    expect(next.columns[1]).toEqual({
      name: 'B',
      type: 'number',
      format: 'usd',
      hidden: true,
      summary: 'sum',
    });
  });

  it('clears the summary for none', () => {
    const data = setColumnSummary(grid(), 1, 'sum');
    expect(setColumnSummary(data, 1, 'none').columns[1].summary).toBeUndefined();
  });
});
