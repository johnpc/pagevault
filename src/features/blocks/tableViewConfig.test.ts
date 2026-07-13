import { describe, it, expect } from 'vitest';
import { captureView, applyView, saveView, deleteView } from './tableViewConfig';
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

describe('captureView', () => {
  it('snapshots filters, board mode, groupBy, and hidden columns', () => {
    const data = grid({
      view: 'board',
      groupBy: 0,
      filters: [{ col: 1, query: 'x' }],
    });
    data.columns[2].hidden = true;
    const v = captureView(data, 'My view');
    expect(v).toEqual({
      name: 'My view',
      view: 'board',
      groupBy: 0,
      filters: [{ col: 1, query: 'x' }],
      hidden: [2],
    });
  });

  it('omits empty sections and drops blank filter conditions', () => {
    const data = grid({ filters: [{ col: 0, query: '' }] });
    expect(captureView(data, 'plain')).toEqual({ name: 'plain' });
  });
});

describe('applyView', () => {
  it('restores view/groupBy/filters and exactly the hidden columns', () => {
    const start = grid();
    start.columns[0].hidden = true; // will be un-hidden by a view that hides [2]
    const applied = applyView(start, {
      name: 'v',
      view: 'board',
      groupBy: 1,
      filters: [{ col: 2, query: 'q' }],
      hidden: [2],
    });
    expect(applied.view).toBe('board');
    expect(applied.groupBy).toBe(1);
    expect(applied.filters).toEqual([{ col: 2, query: 'q' }]);
    expect(applied.columns.map((c) => !!c.hidden)).toEqual([false, false, true]);
    expect(applied.rows).toEqual(start.rows); // data untouched
  });

  it('clears filters/groupBy and shows all columns for a plain view', () => {
    const start = grid({ filters: [{ col: 0, query: 'x' }], groupBy: 0, view: 'board' });
    start.columns[1].hidden = true;
    const applied = applyView(start, { name: 'reset' });
    expect(applied.filters).toBeUndefined();
    expect(applied.groupBy).toBeUndefined();
    expect(applied.view).toBe('table');
    expect(applied.columns.every((c) => !c.hidden)).toBe(true);
  });
});

describe('saveView / deleteView', () => {
  it('appends a captured view, replacing a same-named one', () => {
    let d = saveView(grid({ filters: [{ col: 0, query: 'a' }] }), 'V');
    expect(d.views).toHaveLength(1);
    d = saveView({ ...d, filters: [{ col: 1, query: 'b' }] }, 'V'); // same name → replace
    expect(d.views).toHaveLength(1);
    expect(d.views![0].filters).toEqual([{ col: 1, query: 'b' }]);
  });

  it('ignores a blank name', () => {
    expect(saveView(grid(), '  ').views).toBeUndefined();
  });

  it('deletes a view by name and clears the array when empty', () => {
    const d = saveView(grid(), 'V');
    expect(deleteView(d, 'V').views).toBeUndefined();
  });
});

describe('captureView / applyView with filterMatch', () => {
  const g = (over = {}) => ({
    columns: [
      { name: 'A', type: 'text' as const },
      { name: 'B', type: 'text' as const },
    ],
    rows: [['1', '2']],
    ...over,
  });

  it('captures and restores the OR match mode', () => {
    const data = g({ filters: [{ col: 0, query: 'x' }], filterMatch: 'any' as const });
    const v = captureView(data, 'ors');
    expect(v.filterMatch).toBe('any');
    const applied = applyView(g(), v);
    expect(applied.filterMatch).toBe('any');
  });

  it('a plain view clears any prior match mode', () => {
    const applied = applyView(g({ filterMatch: 'any' as const }), { name: 'reset' });
    expect(applied.filterMatch).toBeUndefined();
  });
});
