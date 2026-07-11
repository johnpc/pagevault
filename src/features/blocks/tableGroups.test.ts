import { describe, it, expect } from 'vitest';
import { firstSelectColumn, boardGroupColumn, groupRows, moveRowToGroup } from './tableGroups';
import type { TableData } from '../../lib/pbTypes';

const board = (): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Status', type: 'select', options: ['Todo', 'Done'] },
  ],
  rows: [
    ['A', 'Todo'],
    ['B', 'Done'],
    ['C', ''],
  ],
});

describe('firstSelectColumn', () => {
  it('finds the first select column, or -1 when none', () => {
    expect(firstSelectColumn(board())).toBe(1);
    expect(firstSelectColumn({ columns: [{ name: 'X', type: 'text' }], rows: [] })).toBe(-1);
  });
});

describe('boardGroupColumn', () => {
  it('honors a valid groupBy select column', () => {
    expect(boardGroupColumn({ ...board(), groupBy: 1 })).toBe(1);
  });
  it('falls back to the first select column when groupBy is unset or not a select', () => {
    expect(boardGroupColumn(board())).toBe(1);
    expect(boardGroupColumn({ ...board(), groupBy: 0 })).toBe(1); // col 0 is text
  });
});

describe('groupRows', () => {
  it('groups rows by option, empty group first, and keeps empty options as drop targets', () => {
    const groups = groupRows(board(), 1);
    expect(groups.map((g) => g.label)).toEqual(['No Status', 'Todo', 'Done']);
    expect(groups[0].rows).toEqual([2]); // C has no status
    expect(groups[1].rows).toEqual([0]); // A = Todo
    expect(groups[2].rows).toEqual([1]); // B = Done
  });

  it('shows an option column even when it has no rows', () => {
    const data: TableData = {
      columns: [
        { name: 'T', type: 'text' },
        { name: 'S', type: 'select', options: ['X', 'Y'] },
      ],
      rows: [['a', 'X']],
    };
    const groups = groupRows(data, 1);
    expect(groups.find((g) => g.value === 'Y')?.rows).toEqual([]);
  });
});

describe('moveRowToGroup', () => {
  it('sets the group cell of one row immutably', () => {
    const d = board();
    const next = moveRowToGroup(d, 0, 1, 'Done');
    expect(next.rows[0]).toEqual(['A', 'Done']);
    expect(d.rows[0]).toEqual(['A', 'Todo']); // original untouched
  });
});
