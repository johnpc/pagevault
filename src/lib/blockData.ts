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

/** How a table block is displayed: the spreadsheet grid, a kanban board grouped
 * by a select column, or a gallery of cards. Defaults to 'table'. */
export type TableViewMode = 'table' | 'board' | 'gallery' | 'calendar';

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
  view?: TableViewMode; // display mode; defaults to 'table'
  groupBy?: number; // for the board view: index of the `select` column to group by
  filter?: { col: number; query: string }; // legacy single filter; migrated to filters[]
  filters?: { col: number; query: string }[]; // non-destructive row filters; absent = off
  filterMatch?: 'all' | 'any'; // combine filters with AND ('all', default) or OR ('any')
  views?: TableView[]; // saved presentational configs the user can switch between
}

/** A saved view: a named snapshot of the grid's presentational config (which
 * view, board grouping, filters + match mode, and which columns are hidden).
 * Applying it restores those onto the grid; row data + order are untouched. */
export interface TableView {
  name: string;
  view?: TableViewMode;
  groupBy?: number;
  filters?: { col: number; query: string }[];
  filterMatch?: 'all' | 'any';
  hidden?: number[]; // indices of columns hidden in this view
}

/** The layout stored in a `columns` block's JSON `data` field: side-by-side
 * text columns (each column is one string of content). */
export interface ColumnsData {
  cols: string[];
}
