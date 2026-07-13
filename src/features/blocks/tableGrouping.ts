import type { TableData } from '../../lib/pbTypes';
import { visibleRows } from './tableFilter';
import { boardGroupColumn } from './tableGroups';
import type { TitleMap } from './cellText';

/** A table group section: a group value + label and the REAL indices of the
 * visible (filtered) rows in it. The empty-string group ("No <col>") is first. */
export interface TableGroup {
  value: string;
  label: string;
  rows: number[]; // real indices into data.rows
}

/** Whether the table view should render grouped sections: the `grouped` flag is
 * on AND there's a select column to group by. Pure. */
export function isGrouped(data: TableData): boolean {
  return data.grouped === true && boardGroupColumn(data) !== -1;
}

/**
 * The visible rows grouped into sections by the group-by column: one section per
 * option (in the column's declared order), preceded by an empty-value section.
 * Only filtered-in rows appear, each keeping its real index. Empty sections are
 * dropped (unlike the board, a table needn't show a droppable lane). Pure.
 */
export function tableGroups(data: TableData, titles?: TitleMap): TableGroup[] {
  const c = boardGroupColumn(data);
  const col = data.columns[c];
  const order: TableGroup[] = [{ value: '', label: `No ${col?.name ?? ''}`.trim(), rows: [] }];
  for (const opt of col?.options ?? []) order.push({ value: opt, label: opt, rows: [] });
  const byValue = new Map(order.map((g) => [g.value, g]));
  for (const { row, index } of visibleRows(data, titles)) {
    const g = byValue.get(row[c] ?? '') ?? order[0];
    g.rows.push(index);
  }
  return order.filter((g) => g.rows.length > 0);
}

/** Carry the grouping config (groupBy column, grouped flag, collapsed sections)
 * from a raw grid onto a normalized one, ignoring an out-of-range groupBy.
 * Mutates `next`. Pure w.r.t. `data`. */
export function applyGrouping(
  next: TableData,
  data: TableData | null | undefined,
  width: number,
): void {
  if (typeof data?.groupBy === 'number' && data.groupBy >= 0 && data.groupBy < width) {
    next.groupBy = data.groupBy;
  }
  if (data?.grouped === true) next.grouped = true;
  const collapsed = (data?.collapsedGroups ?? []).filter((v) => typeof v === 'string');
  if (collapsed.length) next.collapsedGroups = collapsed;
}

/** Whether group `value`'s section is currently collapsed. Pure. */
export function isCollapsed(data: TableData, value: string): boolean {
  return (data.collapsedGroups ?? []).includes(value);
}

/** Toggle group `value`'s collapsed state, returning a new grid. Pure. */
export function toggleCollapsed(data: TableData, value: string): TableData {
  const set = new Set(data.collapsedGroups ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  const out = { ...data };
  if (set.size) out.collapsedGroups = [...set];
  else delete out.collapsedGroups;
  return out;
}
