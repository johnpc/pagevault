import { useState } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { moveColumn } from './tableColumns';
import { usePointerDrag } from './usePointerDrag';

/**
 * Header drag-to-reorder for table columns. Mirrors the row DnD: track the
 * dragged column index locally, and on drop over another column commit the move
 * via `save`. Returns per-column props for the header cell + its drag handle.
 * Mouse uses the native HTML5 drag; touch/pen use Pointer Events (which the
 * native drag ignores) — both converge on the same `drop`, with header cells
 * carrying `data-drag-id={c}` so a finger's release finds the target column.
 */
export function useColumnDnd(data: TableData, save: (next: TableData) => void) {
  const [dragCol, setDragCol] = useState<number | null>(null);

  const drop = (to: number) => {
    if (dragCol !== null && dragCol !== to) save(moveColumn(data, dragCol, to));
    setDragCol(null);
  };

  const pointer = usePointerDrag({
    onDragStart: (id) => setDragCol(Number(id)),
    onDragOver: () => {},
    onDrop: (id) => drop(Number(id)),
    onDragEnd: () => setDragCol(null),
  });

  return {
    dragCol,
    /** Props for the header <th> so it accepts a dropped column (mouse + touch). */
    cellProps: (c: number) => ({
      'data-drag-id': c,
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        drop(c);
      },
    }),
    /** Props for the per-column drag handle button. */
    handleProps: (c: number) => ({
      draggable: true,
      onDragStart: () => setDragCol(c),
      onDragEnd: () => setDragCol(null),
      onPointerDown: pointer.onPointerDown(String(c)),
    }),
  };
}
