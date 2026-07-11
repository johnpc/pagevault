/**
 * Typed shapes for PageVault's PocketBase collections. These mirror the schema
 * defined in `pb_migrations/` — keep the two in sync (the migration is the
 * source of truth; this is the client's view of a returned record).
 *
 * Every base record carries PocketBase's system fields (id + autodates); we add
 * the collection-specific fields on top.
 */
export interface BaseRecord {
  id: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
}

export type BlockType =
  | 'text'
  | 'heading'
  | 'subheading'
  | 'todo'
  | 'quote'
  | 'divider'
  | 'bullet'
  | 'numbered'
  | 'code'
  | 'image'
  | 'callout'
  | 'toggle'
  | 'table';

/** A table column's cell kind. Cells are always stored as strings; the type
 * decides how a cell renders/edits (number input, checkbox, select…). */
export type TableColumnType = 'text' | 'number' | 'checkbox' | 'select';

export interface TableColumn {
  name: string; // header label
  type: TableColumnType;
  options?: string[]; // choices for a `select` column
}

/** The grid stored in a `table` block's JSON `data` field. Cells stay as a
 * string per column; `checkbox` uses 'true'/'' and `select` holds one option. */
export interface TableData {
  columns: TableColumn[];
  rows: string[][];
}

export interface PagesResponse extends BaseRecord {
  title: string;
  icon: string;
  archived: boolean;
  favorite: boolean;
  cover: string; // gradient id, or '' for none
  isPublic: boolean;
  shareToken: string; // random slug for the /shared/<token> link, '' when private
  sort: number;
  parent: string; // '' when top-level
  owner: string;
}

export interface BlocksResponse extends BaseRecord {
  page: string;
  type: BlockType;
  content: string;
  checked: boolean;
  collapsed: boolean; // for `toggle` blocks: hide the nested (deeper-depth) children
  file: string; // uploaded image filename (image blocks); '' when using a URL
  data: TableData | null; // grid for `table` blocks; null for every other type
  color: string; // text/background color token (e.g. 'red', 'yellow-bg'); '' = default
  depth: number; // indentation level (0 = top); for nested lists
  sort: number;
  owner: string;
}

export interface UsersResponse extends BaseRecord {
  email: string;
  name: string;
  verified: boolean;
}
