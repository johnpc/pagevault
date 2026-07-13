import type { TableViewMode } from '../../lib/pbTypes';

/** The non-default view modes: everything except the implicit 'table', which is
 * the default and isn't stored. */
const NON_DEFAULT: TableViewMode[] = ['board', 'gallery', 'calendar'];

/** The view mode to persist for a grid/saved-view: the mode itself when it's a
 * non-default view, else undefined ('table' is the default and isn't stored).
 * Pure — centralizes the "which modes are non-default" rule. */
export function persistedView(view: TableViewMode | undefined): TableViewMode | undefined {
  return view && NON_DEFAULT.includes(view) ? view : undefined;
}
