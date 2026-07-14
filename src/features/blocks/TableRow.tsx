import { memo, type DragEvent } from 'react';
import type { VisibleColumn } from './tableColumns';
import { TableCell } from './TableCell';

interface TableRowProps {
  columns: VisibleColumn[]; // the visible columns (stable unless columns change)
  r: number; // REAL row index into data.rows
  row: string[]; // this row's cells (a stable ref while unedited — see setCell)
  canDelete: boolean; // false when it's the only row (keep at least one)
  dragging: boolean;
  onCell: (r: number, c: number, value: string) => void;
  onDelete: (r: number) => void;
  onDuplicate: (r: number) => void;
  onDragStart: (r: number) => void;
  onDragEnd: () => void;
  onDrop: (r: number) => void;
}

/** One body row: a drag handle, an editable cell per visible column, and
 * duplicate/delete. Takes only its own row + stable callbacks (never the whole
 * grid), so it's memoized below — editing one cell re-renders just that row, not
 * the whole table. `r` is the REAL row index so ops target the right row. */
function TableRowInner({
  columns,
  r,
  row,
  canDelete,
  dragging,
  onCell,
  onDelete,
  onDuplicate,
  onDragStart,
  onDragEnd,
  onDrop,
}: TableRowProps) {
  return (
    <tr
      className={dragging ? 'pv-table-row--dragging' : ''}
      onDragOver={(e: DragEvent) => e.preventDefault()}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        onDrop(r);
      }}
    >
      <td className="pv-table-drag">
        <button
          aria-label={`Drag row ${r + 1}`}
          draggable
          onDragStart={() => onDragStart(r)}
          onDragEnd={onDragEnd}
        >
          ⋮⋮
        </button>
      </td>
      {columns.map(({ column, index: c }) => (
        <td key={c}>
          <TableCell
            column={column}
            value={row[c] ?? ''}
            label={`Cell ${r + 1},${c + 1}`}
            onChange={(v) => onCell(r, c, v)}
          />
        </td>
      ))}
      <td className="pv-table-rowdel">
        <button
          className="pv-table-rowdup"
          aria-label={`Duplicate row ${r + 1}`}
          onClick={() => onDuplicate(r)}
        >
          ⧉
        </button>
        {canDelete && (
          <button aria-label={`Delete row ${r + 1}`} onClick={() => onDelete(r)}>
            ×
          </button>
        )}
      </td>
    </tr>
  );
}

/** Memoized: with stable callbacks + a stable `row`/`columns` from TableBody, a
 * row only re-renders when its own cells, index, or drag state change. */
export const TableRow = memo(TableRowInner);
