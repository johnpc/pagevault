import type { TableData, TableColumnType } from '../../lib/pbTypes';
import { cellText, type TitleMap } from './cellText';

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

/** Numeric comparison that treats an unparseable value as "greater" (sorts
 * after real numbers), so junk in a number column doesn't sort chaotically. */
function cmpNumeric(a: string, b: string): number {
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (isNaN(na) && isNaN(nb)) return 0;
  if (isNaN(na)) return 1;
  if (isNaN(nb)) return -1;
  return na - nb;
}

/** Column types whose empty cells always sort to the bottom — regardless of
 * asc/desc — matching Notion/Airtable/Excel (an empty date/number isn't "less
 * than" or "greater than" real values, it's just absent). */
const BLANKS_LAST_TYPES = new Set<TableColumnType>(['number', 'date']);

/** Compare two cell values for a column, respecting its type: numbers sort
 * numerically, checkboxes checked-first, dates chronologically (ISO), else
 * case-insensitively. Blank handling for number/date is applied separately (see
 * sortByColumn) so blanks stay last in BOTH directions. */
function compareCells(a: string, b: string, type: TableColumnType): number {
  if (type === 'number') return cmpNumeric(a, b);
  if (type === 'checkbox') return (b === 'true' ? 1 : 0) - (a === 'true' ? 1 : 0);
  if (type === 'date') return a < b ? -1 : a > b ? 1 : 0; // ISO sorts lexicographically
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

/** Sort the rows by column `c` ascending or descending (stable, type-aware).
 * `titles` resolves relation cells (page ids) to titles so they sort by name;
 * for a relation column the comparison runs as text on the resolved title. */
export function sortByColumn(
  data: TableData,
  c: number,
  dir: 'asc' | 'desc',
  titles?: TitleMap,
): TableData {
  const column = data.columns[c];
  const type = column?.type ?? 'text';
  const cmpType: TableColumnType = type === 'relation' ? 'text' : type;
  const at = (row: string[]) => (column ? cellText(column, row[c] ?? '', titles) : (row[c] ?? ''));
  const sign = dir === 'desc' ? -1 : 1;
  // For number/date columns, an empty cell always sorts last — in BOTH
  // directions — so it's placed before applying the direction sign.
  const blanksLast = BLANKS_LAST_TYPES.has(cmpType);
  const cmp = (av: string, bv: string) => {
    if (blanksLast && (!av || !bv)) {
      if (!av && !bv) return 0;
      return !av ? 1 : -1; // direction-independent: blank goes to the bottom
    }
    return compareCells(av, bv, cmpType) * sign;
  };
  const rows = data.rows
    .map((row, i) => ({ row, i }))
    .sort((x, y) => cmp(at(x.row), at(y.row)) || x.i - y.i)
    .map((e) => e.row);
  return { columns: data.columns, rows };
}
