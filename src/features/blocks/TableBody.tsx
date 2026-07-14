import { useCallback, useMemo, useState } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { visibleRows } from './tableFilter';
import { visibleColumns } from './tableColumns';
import type { TitleMap } from './cellText';
import { TableRow } from './TableRow';
import { useTableRowActions } from './useTableRowActions';
import { isGrouped, tableGroups, isCollapsed, toggleCollapsed } from './tableGrouping';

/** The table body: editable rows honoring the grid's non-destructive filter,
 * each keeping its REAL index. When grouping is on, rows render under collapsible
 * section headers. Rows are memoized and fed stable callbacks (see
 * useTableRowActions), so editing one cell re-renders only that row. */
export function TableBody({
  data,
  save,
  titles,
}: {
  data: TableData;
  save: (next: TableData) => void;
  titles?: TitleMap;
}) {
  const [dragRow, setDragRow] = useState<number | null>(null);
  const { onCell, onDelete, onDuplicate, moveTo } = useTableRowActions(data, save);
  // Memo on data.columns (not data): setCell preserves the columns array ref, so
  // `columns` stays referentially stable across cell edits — keeping the memoized
  // rows from busting when only a sibling cell changed. visibleColumns reads only
  // data.columns, so this dep is complete despite the lint heuristic.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => visibleColumns(data), [data.columns]);
  const canDelete = data.rows.length > 1;

  const onDragStart = useCallback((r: number) => setDragRow(r), []);
  const onDragEnd = useCallback(() => setDragRow(null), []);
  const onDrop = useCallback(
    (to: number) => {
      setDragRow((from) => {
        if (from !== null) moveTo(from, to);
        return null;
      });
    },
    [moveTo],
  );

  const rowFor = (r: number) => (
    <TableRow
      key={r}
      columns={columns}
      r={r}
      row={data.rows[r]}
      canDelete={canDelete}
      dragging={dragRow === r}
      onCell={onCell}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
    />
  );

  if (isGrouped(data)) {
    const span = columns.length + 2; // + drag + delete columns
    return (
      <tbody>
        {tableGroups(data, titles).map((g) => {
          const collapsed = isCollapsed(data, g.value);
          return [
            <tr key={`h:${g.value}`} className="pv-table-grouphead">
              <td colSpan={span}>
                <button
                  aria-expanded={!collapsed}
                  aria-label={`Group ${g.label}`}
                  onClick={() => save(toggleCollapsed(data, g.value))}
                >
                  {collapsed ? '▸' : '▾'} {g.label}{' '}
                  <span className="pv-muted">{g.rows.length}</span>
                </button>
              </td>
            </tr>,
            ...(collapsed ? [] : g.rows.map(rowFor)),
          ];
        })}
      </tbody>
    );
  }

  return <tbody>{visibleRows(data, titles).map(({ index: r }) => rowFor(r))}</tbody>;
}
