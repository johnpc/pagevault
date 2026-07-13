import type { TableColumn } from '../../lib/pbTypes';

/** A map of page id → display title, used to resolve relation cells (which
 * store a page id) to human text for sorting/filtering/summaries. */
export type TitleMap = Record<string, string>;

/**
 * The comparable/searchable text of a cell. For a `relation` column the stored
 * value is a page id, so it resolves to the linked page's title (empty when
 * unlinked or unknown); every other column type uses the raw value. Pure. */
export function cellText(column: TableColumn, value: string, titles?: TitleMap): string {
  if (column.type === 'relation') return value ? (titles?.[value] ?? '') : '';
  return value;
}
