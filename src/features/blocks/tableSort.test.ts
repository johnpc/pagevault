import { describe, it, expect } from 'vitest';
import { moveRow, sortByColumn } from './tableSort';
import type { TableData, TableColumn } from '../../lib/pbTypes';

const cols = (...names: string[]): TableColumn[] => names.map((name) => ({ name, type: 'text' }));

describe('moveRow', () => {
  it('reorders a body row and no-ops on out-of-range / same index', () => {
    const g: TableData = { columns: cols('A'), rows: [['1'], ['2'], ['3']] };
    expect(moveRow(g, 2, 0).rows).toEqual([['3'], ['1'], ['2']]);
    expect(moveRow(g, 1, 1)).toBe(g);
    expect(moveRow(g, 0, 9)).toBe(g);
  });
});

describe('sortByColumn', () => {
  it('sorts text case-insensitively, both directions', () => {
    const g: TableData = { columns: cols('A'), rows: [['banana'], ['Apple'], ['cherry']] };
    expect(sortByColumn(g, 0, 'asc').rows).toEqual([['Apple'], ['banana'], ['cherry']]);
    expect(sortByColumn(g, 0, 'desc').rows).toEqual([['cherry'], ['banana'], ['Apple']]);
  });

  it('sorts a number column numerically with blanks last', () => {
    const g: TableData = {
      columns: [{ name: 'n', type: 'number' }],
      rows: [['10'], ['2'], [''], ['1']],
    };
    expect(sortByColumn(g, 0, 'asc').rows).toEqual([['1'], ['2'], ['10'], ['']]);
  });

  it('sorts a checkbox column checked-first when ascending', () => {
    const g: TableData = {
      columns: [{ name: 'done', type: 'checkbox' }],
      rows: [[''], ['true'], ['']],
    };
    expect(sortByColumn(g, 0, 'asc').rows).toEqual([['true'], [''], ['']]);
  });

  it('sorts a date column chronologically with blanks last', () => {
    const g: TableData = {
      columns: [{ name: 'due', type: 'date' }],
      rows: [['2026-03-01'], [''], ['2025-12-31'], ['2026-01-15']],
    };
    expect(sortByColumn(g, 0, 'asc').rows).toEqual([
      ['2025-12-31'],
      ['2026-01-15'],
      ['2026-03-01'],
      [''],
    ]);
    // desc flips the comparator sign (consistent with number columns), so the
    // latest real date leads among dated rows and blanks move to the front.
    expect(sortByColumn(g, 0, 'desc').rows).toEqual([
      [''],
      ['2026-03-01'],
      ['2026-01-15'],
      ['2025-12-31'],
    ]);
  });

  it('is stable for equal values', () => {
    const g: TableData = {
      columns: cols('A', 'B'),
      rows: [
        ['x', '1'],
        ['x', '2'],
        ['x', '3'],
      ],
    };
    expect(sortByColumn(g, 0, 'asc').rows).toEqual([
      ['x', '1'],
      ['x', '2'],
      ['x', '3'],
    ]);
  });
});
