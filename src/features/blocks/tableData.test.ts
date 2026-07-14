import { describe, it, expect } from 'vitest';
import {
  emptyTable,
  normalize,
  setCell,
  setColumn,
  setColumnType,
  setColumnSummary,
  addRow,
  addColumn,
  removeRow,
  removeColumn,
} from './tableData';
import type { TableData, TableColumn } from '../../lib/pbTypes';

const cols = (...names: string[]): TableColumn[] => names.map((name) => ({ name, type: 'text' }));

const grid = (): TableData => ({
  columns: cols('A', 'B'),
  rows: [
    ['1', '2'],
    ['3', '4'],
  ],
});

describe('tableData', () => {
  it('emptyTable is a 2-column, 1-row grid of text columns', () => {
    const t = emptyTable();
    expect(t.columns.map((c) => c.type)).toEqual(['text', 'text']);
    expect(t.rows).toEqual([['', '']]);
  });

  it('normalize falls back to an empty table for missing/invalid data', () => {
    expect(normalize(null)).toEqual(emptyTable());
    expect(normalize({ columns: [], rows: [] })).toEqual(emptyTable());
  });

  it('normalize upgrades legacy string[] columns to typed text columns', () => {
    // Older tables stored columns as plain strings; they must still load.
    const legacy = { columns: ['Name', 'Qty'], rows: [['a', 'b']] } as unknown as TableData;
    const n = normalize(legacy);
    expect(n.columns).toEqual([
      { name: 'Name', type: 'text' },
      { name: 'Qty', type: 'text' },
    ]);
  });

  it('normalize pads and truncates ragged rows to the column count', () => {
    const n = normalize({ columns: cols('A', 'B'), rows: [['x'], ['a', 'b', 'c']] });
    expect(n.rows).toEqual([
      ['x', ''],
      ['a', 'b'],
    ]);
  });

  it('normalize preserves refs for already-normal rows/columns (perf: no O(N) churn)', () => {
    // A grid that's already normal (typed columns, correct-width string rows).
    const base = normalize({
      columns: cols('A', 'B'),
      rows: [
        ['x', 'y'],
        ['p', 'q'],
      ],
    });
    const again = normalize(base);
    // Re-normalizing must reuse the same row + column arrays, so a memoized row
    // that only re-renders on ref change stays put after an unrelated save.
    expect(again.rows[0]).toBe(base.rows[0]);
    expect(again.rows[1]).toBe(base.rows[1]);
    expect(again.columns[0]).toBe(base.columns[0]);
    expect(again.columns).toBe(base.columns);
  });

  it('normalize after a single-cell edit only allocates the edited row', () => {
    const base = normalize({
      columns: cols('A', 'B'),
      rows: [
        ['x', 'y'],
        ['p', 'q'],
      ],
    });
    const edited = normalize(setCell(base, 0, 1, 'Y'));
    expect(edited.rows[0]).toEqual(['x', 'Y']); // the edited row is new
    expect(edited.rows[1]).toBe(base.rows[1]); // the untouched row keeps its ref
  });

  it('normalize migrates a legacy single filter into filters[]', () => {
    const n = normalize({
      columns: cols('A', 'B'),
      rows: [['x', 'y']],
      filter: { col: 1, query: 'q' },
    });
    expect(n.filters).toEqual([{ col: 1, query: 'q' }]);
    expect(n.filter).toBeUndefined();
  });

  it('normalize keeps blank (editing) conditions but drops out-of-range columns', () => {
    const n = normalize({
      columns: cols('A', 'B'),
      rows: [['x', 'y']],
      filters: [
        { col: 0, query: '' }, // blank → kept (user is editing it)
        { col: 5, query: 'z' }, // out of range → dropped
      ],
    });
    expect(n.filters).toEqual([{ col: 0, query: '' }]);
  });

  it('setCell replaces just one cell immutably', () => {
    const g = grid();
    const next = setCell(g, 0, 1, 'Z');
    expect(next.rows[0]).toEqual(['1', 'Z']);
    expect(g.rows[0]).toEqual(['1', '2']);
  });

  it('setColumn renames one header, keeping its type', () => {
    const next = setColumn(grid(), 1, 'Beta');
    expect(next.columns[1]).toEqual({ name: 'Beta', type: 'text' });
  });

  it('setColumnType changes a column type', () => {
    const next = setColumnType(grid(), 0, 'number');
    expect(next.columns[0].type).toBe('number');
  });

  it('setColumnType to select seeds options from distinct cell values', () => {
    const data: TableData = { columns: cols('Tag'), rows: [['x'], ['y'], ['x'], ['']] };
    const next = setColumnType(data, 0, 'select');
    expect(next.columns[0]).toEqual({ name: 'Tag', type: 'select', options: ['x', 'y'] });
  });

  it('setColumnType to multiselect seeds options, splitting comma-joined cells', () => {
    const data: TableData = { columns: cols('Tag'), rows: [['x,y'], ['y,z'], ['']] };
    const next = setColumnType(data, 0, 'multiselect');
    expect(next.columns[0]).toEqual({ name: 'Tag', type: 'multiselect', options: ['x', 'y', 'z'] });
  });

  it('setColumnSummary sets a summary and clears it on none, preserved by normalize', () => {
    const set = setColumnSummary(grid(), 0, 'count');
    expect(set.columns[0].summary).toBe('count');
    expect(normalize(set).columns[0].summary).toBe('count'); // survives normalize
    expect(setColumnSummary(set, 0, 'none').columns[0].summary).toBeUndefined();
  });

  it('addRow appends an empty row matching the width', () => {
    const next = addRow(grid());
    expect(next.rows).toHaveLength(3);
    expect(next.rows[2]).toEqual(['', '']);
  });

  it('addColumn adds a text header and an empty cell per row', () => {
    const next = addColumn(grid());
    expect(next.columns[2]).toEqual({ name: 'Column 3', type: 'text' });
    expect(next.rows[0]).toEqual(['1', '2', '']);
  });

  it('removeRow drops a row but never the last one', () => {
    expect(removeRow(grid(), 0).rows).toEqual([['3', '4']]);
    expect(removeRow({ columns: cols('A'), rows: [['x']] }, 0).rows).toEqual([['x']]);
  });

  it('removeColumn drops a column but never the last one', () => {
    const next = removeColumn(grid(), 0);
    expect(next.columns).toEqual(cols('B'));
    expect(next.rows).toEqual([['2'], ['4']]);
    expect(removeColumn({ columns: cols('A'), rows: [['x']] }, 0).columns).toEqual(cols('A'));
  });
});
