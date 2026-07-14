import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { dragIdAtPoint } from './dragPoint';

interface DragBag {
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
}

/**
 * Touch/mouse reordering via Pointer Events — the native HTML5 drag API never
 * fires on touch, so phones couldn't reorder anything. Returns an onPointerDown
 * for a drag handle; while the pointer is down it tracks the row under the point
 * (rows carry `data-drag-id`) and drives the same dnd bag the desktop drag uses,
 * so drop/reorder logic is shared. Only engages for touch/pen (mouse keeps the
 * crisp native HTML5 drag). Returns whether a drag is active (for cursor/UX).
 */
export function usePointerDrag(dnd: DragBag) {
  const [active, setActive] = useState(false);
  const dragging = useRef(false);

  const onPointerDown = useCallback(
    (id: string) => (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return; // native HTML5 drag handles mouse
      e.preventDefault();
      dragging.current = true;
      setActive(true);
      dnd.onDragStart(id);
    },
    [dnd],
  );

  useEffect(() => {
    if (!active) return;
    const onMove = (e: globalThis.PointerEvent) => {
      const over = dragIdAtPoint(e.clientX, e.clientY);
      if (over) dnd.onDragOver(over);
    };
    const onUp = (e: globalThis.PointerEvent) => {
      dragging.current = false;
      setActive(false);
      const over = dragIdAtPoint(e.clientX, e.clientY);
      if (over) dnd.onDrop(over);
      else dnd.onDragEnd();
    };
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [active, dnd]);

  return { onPointerDown, active };
}
