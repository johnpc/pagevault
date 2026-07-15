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
