import { describe, it, expect } from 'vitest';
import {
  emptyTable,
  normalize,
  setCell,
  setColumn,
  addRow,
  addColumn,
  removeRow,
  removeColumn,
} from './tableData';
import type { TableData } from '../../lib/pbTypes';

const grid = (): TableData => ({
  columns: ['A', 'B'],
  rows: [
    ['1', '2'],
    ['3', '4'],
  ],
});

describe('tableData', () => {
  it('emptyTable is a 2-column, 1-row grid', () => {
    const t = emptyTable();
    expect(t.columns).toHaveLength(2);
    expect(t.rows).toEqual([['', '']]);
  });

  it('normalize falls back to an empty table for missing/invalid data', () => {
    expect(normalize(null)).toEqual(emptyTable());
    expect(normalize({ columns: [], rows: [] })).toEqual(emptyTable());
  });

  it('normalize pads and truncates ragged rows to the column count', () => {
    const n = normalize({ columns: ['A', 'B'], rows: [['x'], ['a', 'b', 'c']] });
    expect(n.rows).toEqual([
      ['x', ''],
      ['a', 'b'],
    ]);
  });

  it('setCell replaces just one cell immutably', () => {
    const g = grid();
    const next = setCell(g, 0, 1, 'Z');
    expect(next.rows[0]).toEqual(['1', 'Z']);
    expect(g.rows[0]).toEqual(['1', '2']); // original untouched
  });

  it('setColumn renames one header', () => {
    expect(setColumn(grid(), 1, 'Beta').columns).toEqual(['A', 'Beta']);
  });

  it('addRow appends an empty row matching the width', () => {
    const next = addRow(grid());
    expect(next.rows).toHaveLength(3);
    expect(next.rows[2]).toEqual(['', '']);
  });

  it('addColumn adds a header and an empty cell per row', () => {
    const next = addColumn(grid());
    expect(next.columns).toEqual(['A', 'B', 'Column 3']);
    expect(next.rows[0]).toEqual(['1', '2', '']);
  });

  it('removeRow drops a row but never the last one', () => {
    expect(removeRow(grid(), 0).rows).toEqual([['3', '4']]);
    expect(removeRow({ columns: ['A'], rows: [['x']] }, 0).rows).toEqual([['x']]);
  });

  it('removeColumn drops a column but never the last one', () => {
    const next = removeColumn(grid(), 0);
    expect(next.columns).toEqual(['B']);
    expect(next.rows).toEqual([['2'], ['4']]);
    expect(removeColumn({ columns: ['A'], rows: [['x']] }, 0).columns).toEqual(['A']);
  });
});
