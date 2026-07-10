import { useCallback, useState } from 'react';

/**
 * Minimal drag-and-drop state for reordering blocks. Tracks which block id is
 * being dragged and, on drop over another block, calls `onMove(fromId, toId)`.
 * View-agnostic — BlockRow wires these to native HTML5 drag events.
 */
export function useBlockDnd(onMove: (fromId: string, toId: string) => void) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const onDragStart = useCallback((id: string) => setDraggingId(id), []);
  const onDragOver = useCallback((id: string) => setOverId(id), []);

  const onDrop = useCallback(
    (toId: string) => {
      if (draggingId && draggingId !== toId) onMove(draggingId, toId);
      setDraggingId(null);
      setOverId(null);
    },
    [draggingId, onMove],
  );

  const onDragEnd = useCallback(() => {
    setDraggingId(null);
    setOverId(null);
  }, []);

  return { draggingId, overId, onDragStart, onDragOver, onDrop, onDragEnd };
}
