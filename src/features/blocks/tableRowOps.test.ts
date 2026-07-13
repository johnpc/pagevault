import { describe, it, expect } from 'vitest';
import { duplicateRow } from './tableRowOps';
import type { TableData } from '../../lib/pbTypes';

const data = (): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Status', type: 'select', options: ['Todo', 'Done'] },
  ],
  rows: [
    ['Write', 'Todo'],
    ['Ship', 'Done'],
  ],
});

describe('duplicateRow', () => {
  it('inserts a copy of the row directly below it', () => {
    const out = duplicateRow(data(), 0);
    expect(out.rows).toEqual([
      ['Write', 'Todo'],
      ['Write', 'Todo'],
      ['Ship', 'Done'],
    ]);
  });

  it('duplicates the last row at the end', () => {
    const out = duplicateRow(data(), 1);
    expect(out.rows.at(-1)).toEqual(['Ship', 'Done']);
    expect(out.rows).toHaveLength(3);
  });

  it('copies cells by value (editing the copy does not touch the original)', () => {
    const out = duplicateRow(data(), 0);
    out.rows[1][0] = 'Edited';
    expect(out.rows[0][0]).toBe('Write');
  });

  it('preserves other grid config (columns, view)', () => {
    const out = duplicateRow({ ...data(), view: 'board' }, 0);
    expect(out.view).toBe('board');
    expect(out.columns).toHaveLength(2);
  });

  it('is a no-op for an out-of-range index', () => {
    const d = data();
    expect(duplicateRow(d, -1)).toBe(d);
    expect(duplicateRow(d, 5)).toBe(d);
  });
});
