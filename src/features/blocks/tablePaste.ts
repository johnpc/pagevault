import type { TableData } from '../../lib/pbTypes';

/** Parse clipboard text as a grid: rows split on newline, cells on tab — the
 * TSV shape browsers put on the clipboard when you copy a spreadsheet range.
 * Trailing blank line (common from a copied range) is dropped. Pure. */
export function parseClipboardGrid(text: string): string[][] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines.map((line) => line.split('\t'));
}

/** Whether pasted text is a multi-cell grid (has a tab or an internal newline) —
 * i.e. worth spreading across cells rather than dropping into one. Pure. */
export function isGridPaste(text: string): boolean {
  return text.includes('\t') || text.trimEnd().includes('\n');
}

/**
 * Spread a pasted grid into the table starting at cell (r, c): each pasted cell
 * fills the target cell to its right/below. Rows beyond the current bottom are
 * appended (Notion/Airtable feel); columns beyond the current width are CLIPPED
 * (adding columns would change the schema + types, so paste never widens the
 * table). Returns a new grid, or the original unchanged when there's nothing to
 * spread (single cell). Pure.
 */
export function pasteGrid(data: TableData, r: number, c: number, text: string): TableData {
  if (!isGridPaste(text)) return data;
  const grid = parseClipboardGrid(text);
  const width = data.columns.length;
  const neededRows = r + grid.length;

  // Grow the row list (immutably) so the paste has somewhere to land.
  const rows: string[][] = data.rows.map((row) => [...row]);
  while (rows.length < neededRows) rows.push(data.columns.map(() => ''));

  grid.forEach((cells, gr) => {
    cells.forEach((value, gc) => {
      const col = c + gc;
      if (col < width) rows[r + gr][col] = value; // clip past the last column
    });
  });
  return { ...data, rows };
}
