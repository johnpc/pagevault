import type { TableData } from '../../lib/pbTypes';

/** A fresh 2×2 table (two columns, one empty body row) for a new table block. */
export function emptyTable(): TableData {
  return { columns: ['Name', 'Notes'], rows: [['', '']] };
}

/** Normalize possibly-missing/ragged data into a valid grid (≥1 column, every
 * row padded/truncated to the column count). Pure — guards render + edits. */
export function normalize(data: TableData | null | undefined): TableData {
  if (!data || !Array.isArray(data.columns) || data.columns.length === 0) return emptyTable();
  const width = data.columns.length;
  const rows = (data.rows ?? []).map((row) => {
    const cells = Array.isArray(row) ? row.slice(0, width) : [];
    while (cells.length < width) cells.push('');
    return cells;
  });
  return { columns: data.columns.slice(), rows };
}

/** Set one cell, returning a new grid. */
export function setCell(data: TableData, r: number, c: number, value: string): TableData {
  const rows = data.rows.map((row, i) =>
    i === r ? row.map((v, j) => (j === c ? value : v)) : row,
  );
  return { columns: data.columns, rows };
}

/** Rename one column header, returning a new grid. */
export function setColumn(data: TableData, c: number, label: string): TableData {
  return { columns: data.columns.map((v, j) => (j === c ? label : v)), rows: data.rows };
}

/** Append an empty row. */
export function addRow(data: TableData): TableData {
  return { columns: data.columns, rows: [...data.rows, data.columns.map(() => '')] };
}

/** Append a new column (with a default header) and an empty cell in every row. */
export function addColumn(data: TableData): TableData {
  return {
    columns: [...data.columns, `Column ${data.columns.length + 1}`],
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
