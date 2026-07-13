import type { TableData } from '../../lib/pbTypes';
import { cellText, type TitleMap } from './cellText';

/** One filter condition: rows whose cell in column `col` matches `query`. */
export interface TableCondition {
  col: number;
  query: string;
}

/** A visible row paired with its REAL index in data.rows, so edits/deletes/drags
 * from the filtered view still target the correct underlying row. */
export interface VisibleRow {
  row: string[];
  index: number;
}

/** Whether a cell matches a query for its column type. Case-insensitive
 * "contains" for text/number/select/relation-title; checkbox matches by state.
 * A blank query always matches. Pure. */
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

/** The grid's filter conditions AS EDITED (may include blank rows the user is
 * still filling). Reads the canonical `filters[]`, falling back to the legacy
 * single `filter` for older grids. Pure. */
export function conditions(data: TableData): TableCondition[] {
  return data.filters ?? (data.filter ? [data.filter] : []);
}

/** The ACTIVE conditions used for matching: in-range column + non-blank query. */
function activeConditions(data: TableData): TableCondition[] {
  return conditions(data).filter(
    (f) => f && f.col >= 0 && f.col < data.columns.length && (f.query ?? '').trim() !== '',
  );
}

/** The rows to render given the grid's filters (ALL active ones must match —
 * AND), each with its real index. `titles` resolves relation cells to page
 * titles. Blank/editing conditions don't constrain anything. Pure. */
export function visibleRows(data: TableData, titles?: TitleMap): VisibleRow[] {
  const active = activeConditions(data);
  const all = data.rows.map((row, index) => ({ row, index }));
  if (active.length === 0) return all;
  return all.filter((e) =>
    active.every((f) =>
      cellMatches(
        cellText(data.columns[f.col], e.row[f.col] ?? '', titles),
        f.query,
        data.columns[f.col].type,
      ),
    ),
  );
}

// Condition-editing helpers (setConditions/add/update/removeCondition) live in
// tableConditions.ts; re-exported so callers keep one import site.
export { setConditions, addCondition, updateCondition, removeCondition } from './tableConditions';

/** Migrate a legacy single `filter` into the canonical `filters[]` for a grid of
 * `width` columns: keep any condition targeting a real column (blank queries
 * included — they're mid-edit and just don't constrain matching); drop
 * out-of-range columns. Used by normalize. Pure. */
export function migrateFilters(
  data: TableData | null | undefined,
  width: number,
): TableCondition[] {
  const raw = data?.filters ?? (data?.filter ? [data.filter] : []);
  return raw
    .filter((f) => f && typeof f.col === 'number' && f.col >= 0 && f.col < width)
    .map((f) => ({ col: f.col, query: f.query ?? '' }));
}
