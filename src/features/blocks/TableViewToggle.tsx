import type { TableData, TableViewMode } from '../../lib/pbTypes';
import { firstSelectColumn } from './tableGroups';

/** The Table / Board / Gallery switch above a table. Board needs a `select`
 * column to group by; when there is none the Board option is disabled. */
export function TableViewToggle({
  data,
  onView,
}: {
  data: TableData;
  onView: (view: TableViewMode) => void;
}) {
  const view = data.view ?? 'table';
  const canBoard = firstSelectColumn(data) !== -1;
  const tabs: { mode: TableViewMode; label: string; disabled?: boolean; hint?: string }[] = [
    { mode: 'table', label: 'Table' },
    {
      mode: 'board',
      label: 'Board',
      disabled: !canBoard,
      hint: canBoard ? '' : 'Add a Select column to group a board',
    },
    { mode: 'gallery', label: 'Gallery' },
  ];
  return (
    <div className="pv-table-views" role="tablist" aria-label="Table view">
      {tabs.map((t) => (
        <button
          key={t.mode}
          role="tab"
          aria-selected={view === t.mode}
          className={`pv-table-view${view === t.mode ? ' pv-table-view--on' : ''}`}
          disabled={t.disabled}
          title={t.hint}
          onClick={() => onView(t.mode)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
