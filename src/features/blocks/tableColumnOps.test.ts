import { describe, it, expect } from 'vitest';
import { duplicateColumn } from './tableColumnOps';
import type { TableData } from '../../lib/pbTypes';

const data = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Status', type: 'select', options: ['Todo', 'Done'] },
  ],
  rows: [
    ['Write', 'Todo'],
    ['Ship', 'Done'],
  ],
  ...over,
});

describe('duplicateColumn', () => {
  it('inserts a header + cell copy directly to the right', () => {
    const out = duplicateColumn(data(), 0);
    expect(out.columns.map((c) => c.name)).toEqual(['Task', 'Task', 'Status']);
    expect(out.rows).toEqual([
      ['Write', 'Write', 'Todo'],
      ['Ship', 'Ship', 'Done'],
    ]);
  });

  it('copies the column type and options', () => {
    const out = duplicateColumn(data(), 1);
    expect(out.columns[2]).toEqual({ name: 'Status', type: 'select', options: ['Todo', 'Done'] });
  });

  it('does not mutate the source column when the copy is later changed', () => {
    const out = duplicateColumn(data(), 1);
    out.columns[2].name = 'Changed';
    expect(out.columns[1].name).toBe('Status');
  });

  it('shifts filters and groupBy that point past the insert', () => {
    const out = duplicateColumn(data({ filters: [{ col: 1, query: 'x' }], groupBy: 1 }), 0);
    // Column 1 (Status) is now at index 2 after the copy landed at index 1.
    expect(out.filters).toEqual([{ col: 2, query: 'x' }]);
    expect(out.groupBy).toBe(2);
  });

  it('leaves references before the insert untouched', () => {
    const out = duplicateColumn(data({ filters: [{ col: 0, query: 'x' }] }), 1);
    expect(out.filters).toEqual([{ col: 0, query: 'x' }]);
  });

  it('shifts saved-view indices (filters, groupBy, hidden)', () => {
    const out = duplicateColumn(
      data({ views: [{ name: 'V', filters: [{ col: 1, query: 'x' }], groupBy: 1, hidden: [1] }] }),
      0,
    );
    expect(out.views![0]).toEqual({
      name: 'V',
      filters: [{ col: 2, query: 'x' }],
      groupBy: 2,
      hidden: [2],
    });
  });

  it('is a no-op for an out-of-range index', () => {
    const d = data();
    expect(duplicateColumn(d, -1)).toBe(d);
    expect(duplicateColumn(d, 5)).toBe(d);
  });
});
