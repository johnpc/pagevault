import type { TableData } from '../../lib/pbTypes';

/** A non-destructive row filter stored on the grid: show only rows whose cell in
 * column `col` matches `query`. `query` '' = filter off. Case-insensitive
 * "contains" for text/number/select; for checkbox, "true"/"false" match state. */
export interface TableFilter {
  col: number;
  query: string;
}

/** A visible row paired with its REAL index in data.rows, so edits/deletes/drags
 * from the filtered view still target the correct underlying row. */
export interface VisibleRow {
  row: string[];
  index: number;
}

/** Whether a cell matches the filter query for its column type. Pure. */
function cellMatches(cell: string, query: string, type: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  if (type === 'checkbox') {
    const on = cell === 'true';
    if (q === 'true' || q === 'checked' || q === 'yes') return on;
    if (q === 'false' || q === 'unchecked' || q === 'no') return !on;
    return true;
  }
  return cell.toLowerCase().includes(q);
}

/** The rows to render given the grid's stored filter, each with its real index.
 * No filter (or an out-of-range column) shows every row. Pure. */
export function visibleRows(data: TableData): VisibleRow[] {
  const f = data.filter;
  const all = data.rows.map((row, index) => ({ row, index }));
  if (!f || !f.query.trim() || f.col < 0 || f.col >= data.columns.length) return all;
  const type = data.columns[f.col]?.type ?? 'text';
  return all.filter((e) => cellMatches(e.row[f.col] ?? '', f.query, type));
}

/** Set (or update) the grid's filter. A blank query clears it. Pure. */
export function setFilter(data: TableData, col: number, query: string): TableData {
  if (!query.trim()) {
    const next = { ...data };
    delete next.filter;
    return next;
  }
  return { ...data, filter: { col, query } };
}
