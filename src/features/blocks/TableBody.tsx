import { useMemo } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { visibleRows } from './tableFilter';
import { visibleColumns } from './tableColumns';
import type { TitleMap } from './cellText';
import { TableRow } from './TableRow';
import { useTableRowActions } from './useTableRowActions';
import { useTableGridNav } from './useTableGridNav';
import { useTableRowDnd } from './useTableRowDnd';
import { TableGroupHeader } from './TableGroupHeader';
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
  const { onCell, onDelete, onDuplicate, moveTo, onAddOption, onRemoveOption } = useTableRowActions(
    data,
    save,
  );
  // Memo on data.columns (not data): setCell preserves the columns array ref, so
  // `columns` stays referentially stable across cell edits — keeping the memoized
  // rows from busting when only a sibling cell changed. visibleColumns reads only
  // data.columns, so this dep is complete despite the lint heuristic.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = useMemo(() => visibleColumns(data), [data.columns]);
  const canDelete = data.rows.length > 1;
  // Spreadsheet keyboard nav (Enter/↑/↓ between rows, ←/→ at the text edge).
  const onKeyDown = useTableGridNav({ rows: data.rows.length, cols: data.columns.length });

  const { dragRow, onDragStart, onDragEnd, onDrop, onPointerDown } = useTableRowDnd(moveTo);

  const rowFor = (r: number) => (
    <TableRow
      key={r}
      columns={columns}
      r={r}
      row={data.rows[r]}
      canDelete={canDelete}
      dragging={dragRow === r}
      onCell={onCell}
      onAddOption={onAddOption}
      onRemoveOption={onRemoveOption}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      onPointerDown={onPointerDown}
    />
  );

  if (isGrouped(data)) {
    const span = columns.length + 2; // + drag + delete columns
    return (
      <tbody onKeyDown={onKeyDown}>
        {tableGroups(data, titles).map((g) => {
          const collapsed = isCollapsed(data, g.value);
          return [
            <TableGroupHeader
              key={`h:${g.value}`}
              value={g.value}
              label={g.label}
              count={g.rows.length}
              collapsed={collapsed}
              span={span}
              onToggle={() => save(toggleCollapsed(data, g.value))}
            />,
            ...(collapsed ? [] : g.rows.map(rowFor)),
          ];
        })}
      </tbody>
    );
  }

  return (
    <tbody onKeyDown={onKeyDown}>
      {visibleRows(data, titles).map(({ index: r }) => rowFor(r))}
    </tbody>
  );
}
