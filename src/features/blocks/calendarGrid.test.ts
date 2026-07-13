import { describe, it, expect } from 'vitest';
import { isoDate, parseAnchor, shiftAnchor, monthGrid, firstDateColumn } from './calendarGrid';
import type { TableData } from '../../lib/pbTypes';

const data = (rows: string[][]): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Due', type: 'date' },
  ],
  rows,
});

describe('isoDate', () => {
  it('zero-pads month and day', () => {
    expect(isoDate(2026, 0, 5)).toBe('2026-01-05');
    expect(isoDate(2026, 11, 31)).toBe('2026-12-31');
  });
});

describe('parseAnchor', () => {
  it('parses a YYYY-MM anchor to a 0-based month', () => {
    expect(parseAnchor('2026-07')).toEqual({ year: 2026, month: 6 });
  });
  it('accepts a full ISO date, rejects garbage and bad months', () => {
    expect(parseAnchor('2026-03-14')).toEqual({ year: 2026, month: 2 });
    expect(parseAnchor('nope')).toBeNull();
    expect(parseAnchor('2026-13')).toBeNull();
  });
});

describe('shiftAnchor', () => {
  it('moves months and rolls across year boundaries', () => {
    expect(shiftAnchor('2026-07', 1)).toBe('2026-08');
    expect(shiftAnchor('2026-12', 1)).toBe('2027-01');
    expect(shiftAnchor('2026-01', -1)).toBe('2025-12');
    expect(shiftAnchor('2026-01', -13)).toBe('2024-12');
  });
});

describe('monthGrid', () => {
  it('is 6 weeks of 7 days, marking the anchor month vs spill days', () => {
    const grid = monthGrid(data([]), 1, '2026-07'); // July 2026: 1st is a Wednesday
    expect(grid).toHaveLength(6);
    expect(grid[0]).toHaveLength(7);
    // Leading days spill from June.
    expect(grid[0][0].inMonth).toBe(false);
    expect(grid[0][0].iso).toBe('2026-06-28');
    // July 1 lands on Wednesday (index 3).
    expect(grid[0][3].iso).toBe('2026-07-01');
    expect(grid[0][3].inMonth).toBe(true);
  });

  it('places rows on the day their date column falls on (real indices)', () => {
    const grid = monthGrid(
      data([
        ['A', '2026-07-01'],
        ['B', '2026-07-01'],
        ['C', '2026-07-15'],
      ]),
      1,
      '2026-07',
    );
    const jul1 = grid.flat().find((d) => d.iso === '2026-07-01')!;
    const jul15 = grid.flat().find((d) => d.iso === '2026-07-15')!;
    expect(jul1.rows).toEqual([0, 1]);
    expect(jul15.rows).toEqual([2]);
  });

  it('ignores rows with a blank date and falls back on a bad anchor', () => {
    const grid = monthGrid(data([['A', '']]), 1, 'bad');
    expect(grid.flat().every((d) => d.rows.length === 0)).toBe(true);
  });
});

describe('firstDateColumn', () => {
  it('finds the first date column, or -1 when none', () => {
    expect(firstDateColumn(data([]))).toBe(1);
    expect(firstDateColumn({ columns: [{ name: 'X', type: 'text' }], rows: [] })).toBe(-1);
  });
});
