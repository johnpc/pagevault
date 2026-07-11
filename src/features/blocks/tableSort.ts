import type { TableData, TableColumnType } from '../../lib/pbTypes';

/** Move a body row from index `from` to index `to` (drag reorder). Pure. */
export function moveRow(data: TableData, from: number, to: number): TableData {
  if (from === to || from < 0 || to < 0 || from >= data.rows.length || to >= data.rows.length) {
    return data;
  }
  const rows = data.rows.slice();
  const [moved] = rows.splice(from, 1);
  rows.splice(to, 0, moved);
  return { columns: data.columns, rows };
}

/** Compare two cell values for a column, respecting its type: numbers sort
 * numerically (blanks last), checkboxes checked-first, else case-insensitively. */
function compareCells(a: string, b: string, type: TableColumnType): number {
  if (type === 'number') {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) && isNaN(nb)) return 0;
    if (isNaN(na)) return 1;
    if (isNaN(nb)) return -1;
    return na - nb;
  }
  if (type === 'checkbox') return (b === 'true' ? 1 : 0) - (a === 'true' ? 1 : 0);
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

/** Sort the rows by column `c` ascending or descending (stable, type-aware). */
export function sortByColumn(data: TableData, c: number, dir: 'asc' | 'desc'): TableData {
  const type = data.columns[c]?.type ?? 'text';
  const sign = dir === 'desc' ? -1 : 1;
  const rows = data.rows
    .map((row, i) => ({ row, i }))
    .sort((x, y) => compareCells(x.row[c] ?? '', y.row[c] ?? '', type) * sign || x.i - y.i)
    .map((e) => e.row);
  return { columns: data.columns, rows };
}
