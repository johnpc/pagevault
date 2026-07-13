import { describe, it, expect } from 'vitest';
import { isGrouped, tableGroups, isCollapsed, toggleCollapsed } from './tableGrouping';
import type { TableData } from '../../lib/pbTypes';

const data = (over: Partial<TableData> = {}): TableData => ({
  columns: [
    { name: 'Task', type: 'text' },
    { name: 'Status', type: 'select', options: ['Todo', 'Done'] },
  ],
  rows: [
    ['Write', 'Todo'],
    ['Ship', 'Done'],
    ['Plan', ''],
  ],
  ...over,
});

describe('isGrouped', () => {
  it('is true only when grouped is set and a select column exists', () => {
    expect(isGrouped(data({ grouped: true }))).toBe(true);
    expect(isGrouped(data())).toBe(false);
    expect(isGrouped({ columns: [{ name: 'T', type: 'text' }], rows: [], grouped: true })).toBe(
      false,
    );
  });
});

describe('tableGroups', () => {
  it('groups visible rows by the select column, empty group first, real indices', () => {
    const groups = tableGroups(data({ grouped: true }));
    expect(groups.map((g) => g.label)).toEqual(['No Status', 'Todo', 'Done']);
    expect(groups[0].rows).toEqual([2]); // "Plan" (blank status) — real index 2
    expect(groups[1].rows).toEqual([0]);
    expect(groups[2].rows).toEqual([1]);
  });

  it('drops empty sections and respects the filter', () => {
    const groups = tableGroups(data({ grouped: true, filters: [{ col: 1, query: 'Done' }] }));
    expect(groups.map((g) => g.label)).toEqual(['Done']);
    expect(groups[0].rows).toEqual([1]);
  });
});

describe('collapse', () => {
  it('toggles a group value in and out of collapsedGroups', () => {
    const once = toggleCollapsed(data(), 'Done');
    expect(once.collapsedGroups).toEqual(['Done']);
    expect(isCollapsed(once, 'Done')).toBe(true);
    const twice = toggleCollapsed(once, 'Done');
    expect(twice.collapsedGroups).toBeUndefined();
    expect(isCollapsed(twice, 'Done')).toBe(false);
  });
});
