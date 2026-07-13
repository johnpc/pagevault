/**
 * The JSON payload shapes stored in a block's `data` field, split out from
 * pbTypes so each file stays small. A block's `type` disambiguates which shape
 * its `data` holds (TableData for `table`, ColumnsData for `columns`, null
 * otherwise).
 */

/** A table column's cell kind. Cells are always stored as strings; the type
 * decides how a cell renders/edits (number input, checkbox, select…). */
// `relation` links a row to a page (the cell stores that page's id).
export type TableColumnType = 'text' | 'number' | 'checkbox' | 'select' | 'date' | 'relation';

export interface TableColumn {
  name: string; // header label
  type: TableColumnType;
  options?: string[]; // choices for a `select` column
  summary?: string; // footer calculation kind (see tableSummary SummaryKind); absent = none
  hidden?: boolean; // when true the column is not rendered (data preserved); absent = shown
}

/** The grid stored in a `table` block's JSON `data` field. Cells stay as a
 * string per column; `checkbox` uses 'true'/'' and `select` holds one option. */
export interface TableData {
  columns: TableColumn[];
  rows: string[][];
  view?: 'table' | 'board'; // display mode; defaults to 'table'
  groupBy?: number; // for the board view: index of the `select` column to group by
  filter?: { col: number; query: string }; // non-destructive row filter; absent = off
}

/** The layout stored in a `columns` block's JSON `data` field: side-by-side
 * text columns (each column is one string of content). */
export interface ColumnsData {
  cols: string[];
}
