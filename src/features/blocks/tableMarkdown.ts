import type { TableData, ColumnsData } from '../../lib/pbTypes';
import { normalize } from './tableData';
import { normalizeColumns } from './columnsData';

/** Columns flatten to their contents split by a rule (Markdown has no columns). */
export function columnsToMarkdown(data: ColumnsData | null): string {
  return normalizeColumns(data).cols.filter(Boolean).join('\n\n---\n\n');
}

/** Escape a value for a GFM table cell: a literal pipe would start a new column
 * and a newline would break the row, so escape `\` and `|` and turn newlines
 * into the `<br>` GFM honors inside a cell. Pure. */
export function gfmCell(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

/** A GFM table from a block's grid data. Checkbox cells render as ✓ / blank.
 * Cell + header text is escaped so pipes/newlines can't corrupt the table. Pure. */
export function tableToMarkdown(data: TableData | null): string {
  const { columns, rows } = normalize(data);
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
  const header = line(columns.map((c) => gfmCell(c.name)));
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const cell = (value: string, colIdx: number) =>
    columns[colIdx]?.type === 'checkbox' ? (value === 'true' ? '✓' : '') : gfmCell(value);
  const body = rows.map((r) => line(r.map(cell)));
  return [header, divider, ...body].join('\n');
}
