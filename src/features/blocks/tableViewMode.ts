import type { TableViewMode } from '../../lib/pbTypes';

/** The view mode to persist for a grid/saved-view: 'board' or 'gallery' when
 * that's the mode, else undefined ('table' is the default and isn't stored).
 * Pure — centralizes the "which modes are non-default" rule. */
export function persistedView(view: TableViewMode | undefined): 'board' | 'gallery' | undefined {
  return view === 'board' || view === 'gallery' ? view : undefined;
}
