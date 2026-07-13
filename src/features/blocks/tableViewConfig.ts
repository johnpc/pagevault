import type { TableData, TableView } from '../../lib/pbTypes';
import { conditions } from './tableFilter';
import { persistedView } from './tableViewMode';

/** Snapshot the grid's current presentational config as a named saved view:
 * table/board mode, board grouping, active filters, and which columns are
 * hidden. Row data + order are NOT captured (a view is a lens, not the data). */
export function captureView(data: TableData, name: string): TableView {
  const active = conditions(data).filter((f) => (f.query ?? '').trim() !== '');
  const hidden = data.columns.flatMap((c, i) => (c.hidden ? [i] : []));
  const view: TableView = { name };
  const mode = persistedView(data.view);
  if (mode) view.view = mode;
  if (typeof data.groupBy === 'number') view.groupBy = data.groupBy;
  if (data.grouped === true) view.grouped = true;
  if (active.length) view.filters = active.map((f) => ({ col: f.col, query: f.query }));
  if (data.filterMatch === 'any') view.filterMatch = 'any';
  if (hidden.length) view.hidden = hidden;
  return view;
}

/** Apply a saved view's config onto the grid: set view/groupBy/filters and mark
 * exactly its `hidden` columns hidden (others shown). Returns a new grid; rows
 * are untouched. Pure. */
export function applyView(data: TableData, view: TableView): TableData {
  const hide = new Set(view.hidden ?? []);
  const columns = data.columns.map((c, i) => {
    const next = { ...c };
    if (hide.has(i)) next.hidden = true;
    else delete next.hidden;
    return next;
  });
  const out: TableData = { ...data, columns };
  delete out.filter;
  delete out.filters;
  delete out.filterMatch;
  delete out.groupBy;
  delete out.grouped;
  out.view = persistedView(view.view) ?? 'table';
  if (typeof view.groupBy === 'number') out.groupBy = view.groupBy;
  if (view.grouped === true) out.grouped = true;
  if (view.filters?.length) out.filters = view.filters.map((f) => ({ ...f }));
  if (view.filterMatch === 'any') out.filterMatch = 'any';
  return out;
}

/** Save (append) a captured view under `name`, replacing any existing view with
 * the same name. Pure. */
export function saveView(data: TableData, name: string): TableData {
  const trimmed = name.trim();
  if (!trimmed) return data;
  const captured = captureView(data, trimmed);
  const others = (data.views ?? []).filter((v) => v.name !== trimmed);
  return { ...data, views: [...others, captured] };
}

/** Delete the saved view named `name`. Pure. */
export function deleteView(data: TableData, name: string): TableData {
  const views = (data.views ?? []).filter((v) => v.name !== name);
  const out = { ...data };
  if (views.length) out.views = views;
  else delete out.views;
  return out;
}
