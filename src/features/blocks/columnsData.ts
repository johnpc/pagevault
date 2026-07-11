import type { ColumnsData } from '../../lib/pbTypes';

/** A fresh two-column layout for a new columns block. */
export function emptyColumns(): ColumnsData {
  return { cols: ['', ''] };
}

/** Normalize possibly-missing/invalid data into a valid layout (2–4 columns).
 * Pure — guards render + edits. */
export function normalizeColumns(data: ColumnsData | null | undefined): ColumnsData {
  const cols = Array.isArray(data?.cols) ? data.cols.filter((c) => typeof c === 'string') : [];
  if (cols.length < 2) return emptyColumns();
  return { cols: cols.slice(0, 4) };
}

/** Set one column's text, returning a new layout. */
export function setColumnText(data: ColumnsData, c: number, text: string): ColumnsData {
  return { cols: data.cols.map((v, i) => (i === c ? text : v)) };
}

/** Append an empty column (max 4). */
export function addColumnToLayout(data: ColumnsData): ColumnsData {
  if (data.cols.length >= 4) return data;
  return { cols: [...data.cols, ''] };
}

/** Remove a column by index (min 2). */
export function removeColumnFromLayout(data: ColumnsData, c: number): ColumnsData {
  if (data.cols.length <= 2) return data;
  return { cols: data.cols.filter((_, i) => i !== c) };
}
