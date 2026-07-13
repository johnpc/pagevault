import { type DragEvent } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { setCell, removeRow } from './tableData';
import { visibleColumns } from './tableColumns';
import { TableCell } from './TableCell';

/** One body row: a drag handle, an editable cell per visible column, and a
 * delete button. `r` is the REAL row index so edits/deletes/drags target the
 * right underlying row. Drag state is owned by the parent body. Render-only. */
export function TableRow({
  data,
  save,
  r,
  row,
  dragging,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  data: TableData;
  save: (next: TableData) => void;
  r: number;
  row: string[];
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
}) {
  return (
    <tr
      className={dragging ? 'pv-table-row--dragging' : ''}
      onDragOver={(e: DragEvent) => e.preventDefault()}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <td className="pv-table-drag">
        <button
          aria-label={`Drag row ${r + 1}`}
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          ⋮⋮
        </button>
      </td>
      {visibleColumns(data).map(({ column, index: c }) => (
        <td key={c}>
          <TableCell
            column={column}
            value={row[c] ?? ''}
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
  );
}
