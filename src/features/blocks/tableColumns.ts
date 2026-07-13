import type { TableData, TableColumn, TableColumnType } from '../../lib/pbTypes';

/** Column-property mutators for a table grid, split out of tableData to keep
 * each file small. All pure — return a new grid. */

/** Rename one column header. */
export function setColumn(data: TableData, c: number, name: string): TableData {
  return {
    ...data,
    columns: data.columns.map((col, j) => (j === c ? { ...col, name } : col)),
  };
}

/** Change one column's type (and seed select options from distinct cell
 * values). Type change drops any incompatible summary/options. */
export function setColumnType(data: TableData, c: number, type: TableColumnType): TableData {
  const columns = data.columns.map((col, j) => {
    if (j !== c) return col;
    if (type !== 'select') return { name: col.name, type };
    const options = [...new Set(data.rows.map((row) => row[c]).filter(Boolean))];
    return { name: col.name, type, options };
  });
  return { ...data, columns };
}

/** A column paired with its REAL index, for rendering only the shown columns
 * while edits/sort/filter still target the correct underlying column. */
export interface VisibleColumn {
  column: TableColumn;
  index: number;
}

/** The columns to render (hidden ones skipped), each with its real index. Pure. */
export function visibleColumns(data: TableData): VisibleColumn[] {
  return data.columns.map((column, index) => ({ column, index })).filter((e) => !e.column.hidden);
}

/** Where an index lands after moving an item from `from` to `to`. Pure. */
function remapIndex(i: number, from: number, to: number): number {
  if (i === from) return to;
  if (from < to && i > from && i <= to) return i - 1;
  if (to < from && i >= to && i < from) return i + 1;
  return i;
}

/** Move a column from index `from` to index `to`, carrying its header + every
 * row's cell at that index. Stored bare-index references (filter.col, groupBy)
 * are remapped so they still point at the same column. No-op on out-of-range /
 * same index. Pure. */
export function moveColumn(data: TableData, from: number, to: number): TableData {
  const n = data.columns.length;
  if (from === to || from < 0 || to < 0 || from >= n || to >= n) return data;
  const move = <T>(arr: T[]): T[] => {
    const next = arr.slice();
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    return next;
  };
  const out: TableData = { ...data, columns: move(data.columns), rows: data.rows.map(move) };
  if (out.filter) out.filter = { ...out.filter, col: remapIndex(out.filter.col, from, to) };
  if (out.filters)
    out.filters = out.filters.map((f) => ({ ...f, col: remapIndex(f.col, from, to) }));
  if (typeof out.groupBy === 'number') out.groupBy = remapIndex(out.groupBy, from, to);
  return out;
}

/** Show or hide a column (data preserved either way). Never hides the last
 * visible column, so the table can't become fully blank. Pure. */
export function toggleColumnHidden(data: TableData, c: number, hidden: boolean): TableData {
  const shownCount = data.columns.filter((col) => !col.hidden).length;
  if (hidden && shownCount <= 1) return data; // keep at least one visible column
  const columns = data.columns.map((col, j) => {
    if (j !== c) return col;
    const next = { ...col };
    if (hidden) next.hidden = true;
    else delete next.hidden;
    return next;
  });
  return { ...data, columns };
}

/** Set column `c`'s optional string `field` to `value`, or delete it when the
 * value is falsy or equals `clearWhen`. Preserves every other field. Pure. */
export function setColumnField(
  data: TableData,
  c: number,
  field: 'summary' | 'format',
  value: string,
  clearWhen: string,
): TableData {
  const columns = data.columns.map((col, j) => {
    if (j !== c) return col;
    const next = { ...col };
    if (value && value !== clearWhen) next[field] = value;
    else delete next[field];
    return next;
  });
  return { ...data, columns };
}
