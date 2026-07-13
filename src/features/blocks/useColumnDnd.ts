import { useState } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { moveColumn } from './tableColumns';

/**
 * Header drag-to-reorder for table columns. Mirrors the row DnD: track the
 * dragged column index locally, and on drop over another column commit the move
 * via `save`. Returns per-column props for the header cell + its drag handle.
 */
export function useColumnDnd(data: TableData, save: (next: TableData) => void) {
  const [dragCol, setDragCol] = useState<number | null>(null);

  const drop = (to: number) => {
    if (dragCol !== null && dragCol !== to) save(moveColumn(data, dragCol, to));
    setDragCol(null);
  };

  return {
    dragCol,
    /** Props for the header <th> so it accepts a dropped column. */
    cellProps: (c: number) => ({
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
    }),
  };
}
