import { useCallback, useState } from 'react';
import { usePointerDrag } from './usePointerDrag';

/**
 * Row drag-and-drop for the table body: tracks the dragged row index and, on
 * drop over another row, calls `moveTo(from, to)`. Exposes the native (mouse)
 * handlers plus a pointer-down for touch/pen — the pointer path adapts this
 * index-based scheme to usePointerDrag's string-id bag (rows carry
 * data-drag-id={r}), so touch and mouse share one reorder path.
 */
export function useTableRowDnd(moveTo: (from: number, to: number) => void) {
  const [dragRow, setDragRow] = useState<number | null>(null);

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

  const pointer = usePointerDrag({
    onDragStart: (id) => onDragStart(Number(id)),
    onDragOver: () => {},
    onDrop: (id) => onDrop(Number(id)),
    onDragEnd,
  });

  return { dragRow, onDragStart, onDragEnd, onDrop, onPointerDown: pointer.onPointerDown };
}
