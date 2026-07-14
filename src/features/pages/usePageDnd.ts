import { useCallback, useMemo, useState, type PointerEvent } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { reorderSiblings } from './reorderPages';
import { useReorderPages } from './reorderPagesApi';
import { usePointerDrag } from '../blocks/usePointerDrag';

export interface PageDndHandlers {
  draggingId: string | null;
  overId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
  /** Touch/pen drag start for a row's grip (native drag handles the mouse). */
  onPointerDown: (id: string) => (e: PointerEvent) => void;
}

/**
 * Drag-and-drop reordering for the sidebar page tree. On a drop onto a
 * same-parent sibling it persists the new order; cross-branch drops are no-ops
 * (reparenting stays with the Move picker). Mirrors useBlockDnd's shape.
 */
export function usePageDnd(pages: PageRecord[]): PageDndHandlers {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const reorder = useReorderPages();

  const onDragStart = useCallback((id: string) => setDraggingId(id), []);
  const onDragOver = useCallback((id: string) => setOverId(id), []);
  const reset = useCallback(() => {
    setDraggingId(null);
    setOverId(null);
  }, []);

  const onDrop = useCallback(
    (toId: string) => {
      if (draggingId && draggingId !== toId) {
        const updates = reorderSiblings(pages, draggingId, toId);
        if (updates.length) reorder.mutate(updates);
      }
      reset();
    },
    [draggingId, pages, reorder, reset],
  );

  // Touch/pen path: the row's grip drives the same reorder as the native drag
  // (rows carry data-drag-id); mouse keeps native HTML5 drag.
  const pointer = usePointerDrag({ onDragStart, onDragOver, onDrop, onDragEnd: reset });

  // Memoize the handlers bag so it's stable across renders (only changing with
  // drag state) — lets Sidebar reuse work when only the route/collapse changed.
  return useMemo(
    () => ({
      draggingId,
      overId,
      onDragStart,
      onDragOver,
      onDrop,
      onDragEnd: reset,
      onPointerDown: pointer.onPointerDown,
    }),
    [draggingId, overId, onDragStart, onDragOver, onDrop, reset, pointer.onPointerDown],
  );
}
