import { useState } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { moveRow } from './tableSort';
import { visibleRows } from './tableFilter';
import { visibleColumns } from './tableColumns';
import type { TitleMap } from './cellText';
import { TableRow } from './TableRow';
import { isGrouped, tableGroups, isCollapsed, toggleCollapsed } from './tableGrouping';

/** The table body: editable rows honoring the grid's non-destructive filter,
 * each keeping its REAL index. When grouping is on, rows render under collapsible
 * section headers (grouped by the group-by select column). Row-drag state is
 * local; a drop reorders the underlying rows. */
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
  const drop = (to: number) => {
    if (dragRow !== null && dragRow !== to) save(moveRow(data, dragRow, to));
    setDragRow(null);
  };
  const rowFor = (r: number) => (
    <TableRow
      key={r}
      data={data}
      save={save}
      r={r}
      row={data.rows[r]}
      dragging={dragRow === r}
      onDragStart={() => setDragRow(r)}
      onDragEnd={() => setDragRow(null)}
      onDrop={() => drop(r)}
    />
  );

  if (isGrouped(data)) {
    const span = visibleColumns(data).length + 2; // + drag + delete columns
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
