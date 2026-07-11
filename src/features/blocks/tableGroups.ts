import type { TableData } from '../../lib/pbTypes';

/** A board column: a group value + the row indices whose groupBy cell equals it.
 * The empty-string group ("No <col>") always comes first. */
export interface BoardGroup {
  value: string; // the select option, or '' for ungrouped cards
  label: string;
  rows: number[]; // indices into data.rows
}

/** The index of the first `select` column, or -1 if the table has none. Pure. */
export function firstSelectColumn(data: TableData): number {
  return data.columns.findIndex((c) => c.type === 'select');
}

/** The column the board groups by: the stored groupBy if it's a select column,
 * else the first select column, else -1. Pure. */
export function boardGroupColumn(data: TableData): number {
  const g = data.groupBy;
  if (typeof g === 'number' && data.columns[g]?.type === 'select') return g;
  return firstSelectColumn(data);
}

/**
 * Group the rows into board columns by column `c`'s value: one group per option
 * (in the column's declared order), preceded by an "empty" group for rows with
 * no value. Options with no rows still appear (so you can drop into them). Pure.
 */
export function groupRows(data: TableData, c: number): BoardGroup[] {
  const col = data.columns[c];
  const options = col?.options ?? [];
  const groups: BoardGroup[] = [{ value: '', label: `No ${col?.name ?? ''}`.trim(), rows: [] }];
  for (const opt of options) groups.push({ value: opt, label: opt, rows: [] });
  const byValue = new Map(groups.map((g) => [g.value, g]));
  data.rows.forEach((row, i) => {
    const v = row[c] ?? '';
    (byValue.get(v) ?? groups[0]).rows.push(i);
  });
  return groups;
}

/** Set row `r`'s groupBy-column cell to `value` (moving it to that board group).
 * Returns a new grid. Pure. */
export function moveRowToGroup(data: TableData, r: number, c: number, value: string): TableData {
  const rows = data.rows.map((row, i) =>
    i === r ? row.map((v, j) => (j === c ? value : v)) : row,
  );
  return { ...data, rows };
}
