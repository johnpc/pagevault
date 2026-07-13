import type { TableData } from '../../lib/pbTypes';

/** Set column `c`'s optional string `field` to `value`, or delete it when the
 * value is falsy or equals `clearWhen`. Preserves every other field. Pure. */
function setColumnField(
  data: TableData,
  c: number,
  field: 'summary' | 'format',
  value: string,
  clearWhen: string,
): TableData {
  const columns = data.columns.map((col, j) => {
    if (j !== c) return col;
    const next = { ...col };
    if (value && value !== clearWhen) next[field] = value;
    else delete next[field];
    return next;
  });
  return { ...data, columns };
}

/** Set (or clear) a column's footer summary kind. 'none'/'' clears it. Pure. */
export function setColumnSummary(data: TableData, c: number, summary: string): TableData {
  return setColumnField(data, c, 'summary', summary, 'none');
}

/** Set (or clear) a number column's display format. 'plain'/'' clears it. Pure. */
export function setColumnFormat(data: TableData, c: number, format: string): TableData {
  return setColumnField(data, c, 'format', format, 'plain');
}
