import { describe, it, expect } from 'vitest';
import {
  emptyColumns,
  normalizeColumns,
  setColumnText,
  addColumnToLayout,
  removeColumnFromLayout,
} from './columnsData';
import type { ColumnsData } from '../../lib/pbTypes';

describe('columnsData', () => {
  it('emptyColumns is a 2-column layout', () => {
    expect(emptyColumns()).toEqual({ cols: ['', ''] });
  });

  it('normalizeColumns falls back to empty for missing/short data', () => {
    expect(normalizeColumns(null)).toEqual({ cols: ['', ''] });
    expect(normalizeColumns({ cols: ['only'] })).toEqual({ cols: ['', ''] });
  });

  it('normalizeColumns caps at 4 columns and keeps valid ones', () => {
    const many: ColumnsData = { cols: ['a', 'b', 'c', 'd', 'e'] };
    expect(normalizeColumns(many).cols).toEqual(['a', 'b', 'c', 'd']);
  });

  it('setColumnText replaces one column immutably', () => {
    const d: ColumnsData = { cols: ['a', 'b'] };
    expect(setColumnText(d, 1, 'Z')).toEqual({ cols: ['a', 'Z'] });
    expect(d.cols[1]).toBe('b');
  });

  it('addColumnToLayout appends up to 4', () => {
    expect(addColumnToLayout({ cols: ['a', 'b'] }).cols).toEqual(['a', 'b', '']);
    const full: ColumnsData = { cols: ['a', 'b', 'c', 'd'] };
    expect(addColumnToLayout(full)).toBe(full);
  });

  it('removeColumnFromLayout drops a column but never below 2', () => {
    expect(removeColumnFromLayout({ cols: ['a', 'b', 'c'] }, 1).cols).toEqual(['a', 'c']);
    const two: ColumnsData = { cols: ['a', 'b'] };
    expect(removeColumnFromLayout(two, 0)).toBe(two);
  });
});
