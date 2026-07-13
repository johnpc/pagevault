import type { TableData } from '../../lib/pbTypes';
import { firstSelectColumn, boardGroupColumn } from './tableGroups';

/** The "Group" toggle for the table view: turns collapsible group sections on/
 * off, grouped by the first (or chosen) select column. Hidden when the table
 * has no select column to group by. Render-only. */
export function TableGroupToggle({
  data,
  save,
}: {
  data: TableData;
  save: (next: TableData) => void;
}) {
  if (firstSelectColumn(data) === -1) return null;
  const on = data.grouped === true;
  const col = data.columns[boardGroupColumn(data)];
  const toggle = () => {
    const next = { ...data };
    if (on) {
      delete next.grouped;
      delete next.collapsedGroups;
    } else {
      next.grouped = true;
    }
    save(next);
  };
  return (
    <button
      className="pv-table-group-btn"
      aria-pressed={on}
      onClick={toggle}
      title={col ? `Group by ${col.name}` : 'Group'}
    >
      ⿴ Group{on && col ? `: ${col.name}` : ''}
    </button>
  );
}
