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

/** Set (or clear) a column's footer summary kind. 'none'/'' clears it. */
export function setColumnSummary(data: TableData, c: number, summary: string): TableData {
  const columns = data.columns.map((col, j) => {
    if (j !== c) return col;
    const next: TableColumn = { name: col.name, type: col.type };
    if (col.options) next.options = col.options;
    if (summary && summary !== 'none') next.summary = summary;
    return next;
  });
  return { ...data, columns };
}
