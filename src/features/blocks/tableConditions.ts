import type { TableData } from '../../lib/pbTypes';
import { conditions, type TableCondition } from './tableFilter';

/** Filter-condition editing helpers (the write side of the multi-condition
 * filter). Split from tableFilter (the read/match side) to keep each small. All
 * pure — return a new grid. */

/** Write the exact condition list (keeps blank rows so the user can type into
 * them); clears the filter entirely when empty. Always collapses the legacy
 * single `filter` into the canonical `filters[]`. */
export function setConditions(data: TableData, next: TableCondition[]): TableData {
  const out = { ...data };
  delete out.filter;
  if (next.length === 0) delete out.filters;
  else out.filters = next;
  return out;
}

/** Add an empty condition on `col` (a new filter row for the user to fill). */
export function addCondition(data: TableData, col = 0): TableData {
  return setConditions(data, [...conditions(data), { col, query: '' }]);
}

/** Update the condition at position `i`. */
export function updateCondition(
  data: TableData,
  i: number,
  patch: Partial<TableCondition>,
): TableData {
  return setConditions(
    data,
    conditions(data).map((f, j) => (j === i ? { ...f, ...patch } : f)),
  );
}

/** Remove the condition at position `i`. */
export function removeCondition(data: TableData, i: number): TableData {
  return setConditions(
    data,
    conditions(data).filter((_, j) => j !== i),
  );
}
