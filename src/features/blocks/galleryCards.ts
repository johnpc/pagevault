import type { TableData } from '../../lib/pbTypes';
import { visibleRows } from './tableFilter';
import { visibleColumns } from './tableColumns';
import { cellText, type TitleMap } from './cellText';

/** One field on a gallery card: the column's label + the cell's display text,
 * plus the real column index so an edit targets the right cell. */
export interface GalleryField {
  col: number; // real index into data.columns
  label: string;
  value: string; // display text (relation cells resolved to the page title)
}

/** A gallery card: one visible row rendered as a title (its first visible
 * column) followed by the remaining visible columns as fields. `row` is the
 * real index into data.rows so edits/deletes target the right underlying row. */
export interface GalleryCard {
  row: number; // real index into data.rows
  titleCol: number; // real index of the title column (-1 if the table has no columns)
  title: string; // raw stored title-cell value (edited in place)
  fields: GalleryField[];
}

/** Build the gallery's cards from the grid: the visible rows (filters applied),
 * each shown as a card whose title is the first visible column and whose fields
 * are the rest. Relation fields resolve to the linked page's title. Pure. */
export function galleryCards(data: TableData, titles?: TitleMap): GalleryCard[] {
  const cols = visibleColumns(data);
  const titleCol = cols.length ? cols[0].index : -1;
  const fieldCols = cols.slice(1);
  return visibleRows(data, titles).map(({ row, index }) => ({
    row: index,
    titleCol,
    title: titleCol === -1 ? '' : (row[titleCol] ?? ''),
    fields: fieldCols.map((c) => ({
      col: c.index,
      label: c.column.name,
      value: cellText(c.column, row[c.index] ?? '', titles),
    })),
  }));
}
