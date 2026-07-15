import type { TableData } from '../../lib/pbTypes';
import { selectedValues } from './multiSelect';

/**
 * Remove an option from a select/multiselect column AND strip it from every
 * cell: a multiselect cell drops that tag (comma-join preserved), a select cell
 * equal to it is cleared. Pure — returns the grid unchanged if the column isn't
 * a (multi)select or doesn't have the option.
 */
export function removeColumnOption(data: TableData, c: number, option: string): TableData {
  const col = data.columns[c];
  const isSelect = col?.type === 'select' || col?.type === 'multiselect';
  if (!isSelect || !(col.options ?? []).includes(option)) return data;

  const columns = data.columns.map((cc, j) =>
    j === c ? { ...cc, options: (cc.options ?? []).filter((o) => o !== option) } : cc,
  );
  const rows = data.rows.map((row) =>
    row.map((cell, j) => {
      if (j !== c) return cell;
      if (col.type === 'multiselect')
        return selectedValues(cell)
          .filter((v) => v !== option)
          .join(',');
      return cell === option ? '' : cell;
    }),
  );
  return { ...data, columns, rows };
}

/**
 * Rename an option on a select/multiselect column, updating the column's option
 * list AND every cell that used the old name (a multiselect cell swaps the tag
 * in place, keeping order; a select cell equal to it is repointed). Pure —
 * no-ops if the column isn't a (multi)select, the old name is absent, or the new
 * name is blank / unchanged / already an option. (The tag's color follows its
 * name, since color is derived from the name and not stored.)
 */
/** Whether renaming `from`→`to` on column `c` is a valid, non-trivial change:
 * the column is a (multi)select that has `from`, and `to` is a fresh, distinct,
 * non-blank name. Pure — keeps renameColumnOption's branch count (CRAP) low. */
function canRename(data: TableData, c: number, from: string, to: string): boolean {
  const col = data.columns[c];
  const isSelect = col?.type === 'select' || col?.type === 'multiselect';
  const opts = col?.options ?? [];
  return isSelect && opts.includes(from) && !!to && to !== from && !opts.includes(to);
}

export function renameColumnOption(
  data: TableData,
  c: number,
  from: string,
  to: string,
): TableData {
  const col = data.columns[c];
  const next = to.trim();
  if (!canRename(data, c, from, next)) return data;

  const columns = data.columns.map((cc, j) =>
    j === c ? { ...cc, options: (cc.options ?? []).map((o) => (o === from ? next : o)) } : cc,
  );
  const rows = data.rows.map((row) =>
    row.map((cell, j) => {
      if (j !== c) return cell;
      if (col.type === 'multiselect')
        return selectedValues(cell)
          .map((v) => (v === from ? next : v))
          .join(',');
      return cell === from ? next : cell;
    }),
  );
  return { ...data, columns, rows };
}
