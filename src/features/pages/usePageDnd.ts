import { useCallback, useState } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { reorderSiblings } from './reorderPages';
import { useReorderPages } from './reorderPagesApi';

export interface PageDndHandlers {
  draggingId: string | null;
  overId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
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

  return { draggingId, overId, onDragStart, onDragOver, onDrop, onDragEnd: reset };
}
