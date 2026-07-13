import type { TableData } from '../../lib/pbTypes';

/** Duplicate row `r`, inserting the copy directly below it (Notion's row
 * "Duplicate"). The copy carries all the same cell values. No-op for an
 * out-of-range index. Pure. */
export function duplicateRow(data: TableData, r: number): TableData {
  if (r < 0 || r >= data.rows.length) return data;
  const copy = [...data.rows[r]];
  const rows = [...data.rows.slice(0, r + 1), copy, ...data.rows.slice(r + 1)];
  return { ...data, rows };
}
