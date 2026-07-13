import { describe, it, expect } from 'vitest';
import { setFilterMatch } from './tableConditions';
import type { TableData } from '../../lib/pbTypes';

const grid = (over: Partial<TableData> = {}): TableData => ({
  columns: [{ name: 'A', type: 'text' }],
  rows: [['1']],
  ...over,
});

describe('setFilterMatch', () => {
  it("stores 'any' and clears back to the default on 'all'", () => {
    const any = setFilterMatch(grid(), 'any');
    expect(any.filterMatch).toBe('any');
    expect(setFilterMatch(any, 'all').filterMatch).toBeUndefined();
  });
});
