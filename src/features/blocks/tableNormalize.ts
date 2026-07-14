import type { TableData, TableColumn } from '../../lib/pbTypes';
import { migrateFilters } from './tableFilter';
import { persistedView } from './tableViewMode';
import { applyGrouping } from './tableGrouping';
import { emptyTable, col } from './tableData';

/** Coerce one column entry (which may be a legacy plain string from an older
 * table) into a typed TableColumn. Returns the SAME object when it's already a
 * normalized column, so re-normalizing after an edit preserves column
 * references — keeping the visibleColumns memo (and thus every memoized
 * TableRow) from busting when only a cell changed. */
function toColumn(c: TableColumn | string): TableColumn {
  if (typeof c === 'string') return col(c);
  if (c.type) return c; // already typed → normal form, keep the ref
  return {
    name: c.name,
    type: c.type ?? 'text',
    ...(c.options ? { options: c.options } : {}),
    ...(c.summary ? { summary: c.summary } : {}),
    ...(c.format ? { format: c.format } : {}),
    ...(c.wrap ? { wrap: true } : {}),
    ...(c.hidden ? { hidden: true } : {}),
  };
}

/** Map with reference preservation: returns the SAME array when `fn` returned
 * every element unchanged, so downstream `[arr]` memo deps stay stable. */
function mapStable<T>(arr: T[], fn: (x: T) => T): T[] {
  let changed = false;
  const out = arr.map((x) => {
    const y = fn(x);
    if (y !== x) changed = true;
    return y;
  });
  return changed ? out : arr;
}

/** Bring one row to exactly `width` cells of strings, returning the SAME array
 * when it's already correct — so a re-normalize after a single-cell edit only
 * allocates the edited row (O(1) churn, not O(rows)). */
function normalizeRow(row: string[], width: number): string[] {
  if (Array.isArray(row) && row.length === width && row.every((v) => typeof v === 'string')) {
    return row;
  }
  const cells = Array.isArray(row) ? row.slice(0, width) : [];
  while (cells.length < width) cells.push('');
  return cells;
}

/** Carry the presentational config (view mode, grouping, filters + match mode,
 * saved views) from the raw grid onto the normalized one, dropping any that
 * references a missing column. Mutates `next`. Pure w.r.t. `data`. */
function applyConfig(next: TableData, data: TableData | null | undefined, width: number): void {
  const view = persistedView(data?.view);
  if (view) next.view = view;
  applyGrouping(next, data, width);
  const filters = migrateFilters(data, width);
  if (filters.length) next.filters = filters;
  if (data?.filterMatch === 'any') next.filterMatch = 'any';
  const views = (data?.views ?? []).filter((v) => v && typeof v.name === 'string' && v.name);
  if (views.length) next.views = views;
}

/** Normalize possibly-missing/ragged/legacy data into a valid typed grid (≥1
 * column, every row padded/truncated to the column count), upgrading old
 * string[] columns to typed ones. Reference-preserving (see helpers) so it's
 * cheap to re-run on every edit. Pure. */
export function normalize(data: TableData | null | undefined): TableData {
  const raw = (data?.columns ?? []) as (TableColumn | string)[];
  if (raw.length === 0) return emptyTable();
  const columns = mapStable(raw as TableColumn[], (c) => toColumn(c));
  const width = columns.length;
  const rows = mapStable(data?.rows ?? [], (row) => normalizeRow(row as string[], width));
  const next: TableData = { columns, rows };
  applyConfig(next, data, width);
  return next;
}
