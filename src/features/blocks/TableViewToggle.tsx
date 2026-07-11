import type { TableData } from '../../lib/pbTypes';
import { firstSelectColumn } from './tableGroups';

/** The Table / Board switch above a table. Board needs a `select` column to
 * group by; when there is none the Board option is disabled. */
export function TableViewToggle({
  data,
  onView,
}: {
  data: TableData;
  onView: (view: 'table' | 'board') => void;
}) {
  const view = data.view ?? 'table';
  const canBoard = firstSelectColumn(data) !== -1;
  return (
    <div className="pv-table-views" role="tablist" aria-label="Table view">
      <button
        role="tab"
        aria-selected={view === 'table'}
        className={`pv-table-view${view === 'table' ? ' pv-table-view--on' : ''}`}
        onClick={() => onView('table')}
      >
        Table
      </button>
      <button
        role="tab"
        aria-selected={view === 'board'}
        className={`pv-table-view${view === 'board' ? ' pv-table-view--on' : ''}`}
        disabled={!canBoard}
        title={canBoard ? '' : 'Add a Select column to group a board'}
        onClick={() => onView('board')}
      >
        Board
      </button>
    </div>
  );
}
