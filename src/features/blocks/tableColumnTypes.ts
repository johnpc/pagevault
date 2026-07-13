import type { TableColumnType } from '../../lib/pbTypes';

/** The column types offered in the header type picker, in menu order. */
export const COLUMN_TYPES: TableColumnType[] = [
  'text',
  'number',
  'checkbox',
  'select',
  'multiselect',
  'date',
  'relation',
];
