import { useState, type DragEvent } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { setCell, removeRow } from './tableData';
import { moveRow } from './tableSort';
import { visibleRows } from './tableFilter';
import { TableCell } from './TableCell';

/** The table body: editable cells plus a per-row drag handle for reordering.
 * Rows honor the grid's non-destructive filter — each rendered row keeps its
 * REAL index so edits/deletes/drags target the right underlying row. Row-drag
 * state is local; a drop commits the new order via `save`. */
export function TableBody({ data, save }: { data: TableData; save: (next: TableData) => void }) {
  const [dragRow, setDragRow] = useState<number | null>(null);

  const drop = (to: number) => {
    if (dragRow !== null && dragRow !== to) save(moveRow(data, dragRow, to));
    setDragRow(null);
  };

  return (
    <tbody>
      {visibleRows(data).map(({ row, index: r }) => (
        <tr
          key={r}
          className={dragRow === r ? 'pv-table-row--dragging' : ''}
          onDragOver={(e: DragEvent) => e.preventDefault()}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            drop(r);
          }}
        >
          <td className="pv-table-drag">
            <button
              aria-label={`Drag row ${r + 1}`}
              draggable
              onDragStart={() => setDragRow(r)}
              onDragEnd={() => setDragRow(null)}
            >
              ⋮⋮
            </button>
          </td>
          {row.map((cell, c) => (
            <td key={c}>
              <TableCell
                column={data.columns[c]}
                value={cell}
                label={`Cell ${r + 1},${c + 1}`}
                onChange={(v) => save(setCell(data, r, c, v))}
              />
            </td>
          ))}
          <td className="pv-table-rowdel">
            {data.rows.length > 1 && (
              <button aria-label={`Delete row ${r + 1}`} onClick={() => save(removeRow(data, r))}>
                ×
              </button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  );
}
