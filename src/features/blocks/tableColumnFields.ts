import type { TableData } from '../../lib/pbTypes';
import { setColumnField } from './tableColumns';

/** Set (or clear) a column's footer summary kind. 'none'/'' clears it. Pure. */
export function setColumnSummary(data: TableData, c: number, summary: string): TableData {
  return setColumnField(data, c, 'summary', summary, 'none');
}

/** Set (or clear) a number column's display format. 'plain'/'' clears it. Pure. */
export function setColumnFormat(data: TableData, c: number, format: string): TableData {
  return setColumnField(data, c, 'format', format, 'plain');
}
