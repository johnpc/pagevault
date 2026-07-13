/**
 * Typed shapes for PageVault's PocketBase collections. These mirror the schema
 * defined in `pb_migrations/` — keep the two in sync (the migration is the
 * source of truth; this is the client's view of a returned record).
 *
 * Every base record carries PocketBase's system fields (id + autodates); we add
 * the collection-specific fields on top.
 */
import type { TableData, ColumnsData } from './blockData';
import type { ShareRole } from './collabTypes';

// Re-export the block `data` payload shapes so existing imports from the
// pbTypes barrel keep working after the split into blockData.ts.
export type {
  TableColumnType,
  TableViewMode,
  TableColumn,
  TableData,
  TableView,
  ColumnsData,
} from './blockData';

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
  | 'table'
  | 'columns'
  | 'toc'
  | 'bookmark'
  | 'embed';

export interface PagesResponse extends BaseRecord {
  title: string;
  icon: string;
  archived: boolean;
  favorite: boolean;
  cover: string; // gradient id, or '' for none
  coverImage: string; // uploaded cover image filename; '' when using a gradient/none
  isPublic: boolean;
  shareToken: string; // random slug for the /shared/<token> link, '' when private
  fullWidth: boolean; // widen the content area beyond the reading column
  font: string; // per-page typeface: '' | 'default' (sans), 'serif', 'mono'
  inviteToken: string; // random slug for the /join/<token> invite link, '' when none
  inviteRole: ShareRole | ''; // the role the invite link grants
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
  data: TableData | ColumnsData | null; // table grid / column layout; null otherwise
  color: string; // text/background color token (e.g. 'red', 'yellow-bg'); '' = default
  lang: string; // code block language (e.g. 'js', 'python'); '' = plain
  emoji: string; // callout leading icon (e.g. '💡', '⚠️'); '' = default 💡
  depth: number; // indentation level (0 = top); for nested lists
  sort: number;
  owner: string;
}

export interface UsersResponse extends BaseRecord {
  email: string;
  name: string;
  verified: boolean;
}

export interface CommentsResponse extends BaseRecord {
  page: string;
  body: string;
  owner: string;
}

// Collaboration record shapes (memberships + presence) live in collabTypes.ts;
// re-exported here so callers keep importing them from the pbTypes barrel.
export type { ShareRole, SharesResponse, PresenceResponse } from './collabTypes';
