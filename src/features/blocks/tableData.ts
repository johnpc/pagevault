import type { TableData, TableColumn, TableColumnType } from '../../lib/pbTypes';
import { migrateFilters } from './tableFilter';

const col = (name: string, type: TableColumnType = 'text'): TableColumn => ({ name, type });

/** A fresh 2-column, 1-row table for a new table block. */
export function emptyTable(): TableData {
  return { columns: [col('Name'), col('Notes')], rows: [['', '']] };
}

/** Coerce one column entry (which may be a legacy plain string from an older
 * table) into a typed TableColumn. */
function toColumn(c: TableColumn | string): TableColumn {
  if (typeof c === 'string') return col(c);
  return {
    name: c.name,
    type: c.type ?? 'text',
    ...(c.options ? { options: c.options } : {}),
    ...(c.summary ? { summary: c.summary } : {}),
    ...(c.hidden ? { hidden: true } : {}),
  };
}

/** Normalize possibly-missing/ragged/legacy data into a valid typed grid (≥1
 * column, every row padded/truncated to the column count). Pure — guards render
 * + edits, and upgrades old string[] columns to typed ones. */
export function normalize(data: TableData | null | undefined): TableData {
  const raw = (data?.columns ?? []) as (TableColumn | string)[];
  if (raw.length === 0) return emptyTable();
  const columns = raw.map(toColumn);
  const width = columns.length;
  const rows = (data?.rows ?? []).map((row) => {
    const cells = Array.isArray(row) ? row.slice(0, width) : [];
    while (cells.length < width) cells.push('');
    return cells;
  });
  const next: TableData = { columns, rows };
  if (data?.view === 'board') next.view = 'board';
  // Keep groupBy only if it points at a real column, else clamp to the default.
  if (typeof data?.groupBy === 'number' && data.groupBy >= 0 && data.groupBy < width) {
    next.groupBy = data.groupBy;
  }
  const filters = migrateFilters(data, width);
  if (filters.length) next.filters = filters;
  // Saved views are named presentational configs; keep any with a name.
  const views = (data?.views ?? []).filter((v) => v && typeof v.name === 'string' && v.name);
  if (views.length) next.views = views;
  return next;
}

/** Set one cell, returning a new grid. */
export function setCell(data: TableData, r: number, c: number, value: string): TableData {
  const rows = data.rows.map((row, i) =>
    i === r ? row.map((v, j) => (j === c ? value : v)) : row,
  );
  return { columns: data.columns, rows };
}

// Column-property mutators (setColumn / setColumnType / setColumnSummary) live
// in tableColumns.ts; re-exported so callers keep importing them from here.
export { setColumn, setColumnType, setColumnSummary } from './tableColumns';

/** Append an empty row. */
export function addRow(data: TableData): TableData {
  return { columns: data.columns, rows: [...data.rows, data.columns.map(() => '')] };
}

/** Append a new text column and an empty cell in every row. */
export function addColumn(data: TableData): TableData {
  return {
    columns: [...data.columns, col(`Column ${data.columns.length + 1}`)],
    rows: data.rows.map((row) => [...row, '']),
  };
}

/** Remove a row by index (no-op if it would leave zero rows). */
export function removeRow(data: TableData, r: number): TableData {
  if (data.rows.length <= 1) return data;
  return { columns: data.columns, rows: data.rows.filter((_, i) => i !== r) };
}

/** Remove a column by index (no-op if it would leave zero columns). */
export function removeColumn(data: TableData, c: number): TableData {
  if (data.columns.length <= 1) return data;
  return {
    columns: data.columns.filter((_, j) => j !== c),
    rows: data.rows.map((row) => row.filter((_, j) => j !== c)),
  };
}
