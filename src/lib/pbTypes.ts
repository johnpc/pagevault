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

export type BlockType = 'text' | 'heading' | 'subheading' | 'todo' | 'quote' | 'divider';

export interface PagesResponse extends BaseRecord {
  title: string;
  icon: string;
  archived: boolean;
  sort: number;
  parent: string; // '' when top-level
  owner: string;
}

export interface BlocksResponse extends BaseRecord {
  page: string;
  type: BlockType;
  content: string;
  checked: boolean;
  sort: number;
  owner: string;
}

export interface UsersResponse extends BaseRecord {
  email: string;
  name: string;
  verified: boolean;
}
