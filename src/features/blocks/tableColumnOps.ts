import type { TableData, TableView } from '../../lib/pbTypes';

/** A stored column index after a new column is inserted at position `at`:
 * indices >= `at` shift right by one. Pure. */
const shift = (i: number, at: number): number => (i >= at ? i + 1 : i);

/** Remap a saved view's stored column indices for an insert at `at`. Pure. */
function shiftView(v: TableView, at: number): TableView {
  const out: TableView = { ...v };
  if (v.filters) out.filters = v.filters.map((f) => ({ ...f, col: shift(f.col, at) }));
  if (typeof v.groupBy === 'number') out.groupBy = shift(v.groupBy, at);
  if (v.hidden) out.hidden = v.hidden.map((i) => shift(i, at));
  return out;
}

/** Duplicate column `c`, inserting the copy directly to its right (Notion's
 * column Duplicate). The new column copies the header (name/type/options/
 * summary/hidden) and every row's cell at that index. Stored bare-index
 * references (filters, groupBy, saved views) are shifted so they still target
 * the same columns. No-op for an out-of-range index. Pure. */
export function duplicateColumn(data: TableData, c: number): TableData {
  if (c < 0 || c >= data.columns.length) return data;
  const at = c + 1; // the inserted copy's index
  const columns = [...data.columns.slice(0, at), { ...data.columns[c] }, ...data.columns.slice(at)];
  const rows = data.rows.map((row) => [...row.slice(0, at), row[c] ?? '', ...row.slice(at)]);
  const out: TableData = { ...data, columns, rows };
  if (out.filter) out.filter = { ...out.filter, col: shift(out.filter.col, at) };
  if (out.filters) out.filters = out.filters.map((f) => ({ ...f, col: shift(f.col, at) }));
  if (typeof out.groupBy === 'number') out.groupBy = shift(out.groupBy, at);
  if (out.views) out.views = out.views.map((v) => shiftView(v, at));
  return out;
}
