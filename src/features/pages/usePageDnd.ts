import { useCallback, useMemo, useRef, useState, type PointerEvent } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { reorderSiblings } from './reorderPages';
import { useReorderPages } from './reorderPagesApi';
import { usePointerDrag } from '../blocks/usePointerDrag';

/** Referentially-stable drag handlers — safe to spread onto every memoized row. */
export interface PageDndHandlers {
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
  /** Touch/pen drag start for a row's grip (native drag handles the mouse). */
  onPointerDown: (id: string) => (e: PointerEvent) => void;
}

/** usePageDnd's return: the live drag state + the stable handlers. */
export interface PageDnd {
  draggingId: string | null;
  overId: string | null;
  handlers: PageDndHandlers;
}

/**
 * Drag-and-drop reordering for the sidebar page tree. On a drop onto a
 * same-parent sibling it persists the new order; cross-branch drops are no-ops
 * (reparenting stays with the Move picker). Mirrors useBlockDnd's shape.
 */
export function usePageDnd(pages: PageRecord[]): PageDnd {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const reorder = useReorderPages();

  // Live drag context read by the (stable) onDrop, so the handlers never change
  // identity when draggingId/pages change — the memoized SidebarRow then only
  // re-renders the two rows whose dragging/over booleans actually flip, not the
  // whole tree on every dragover.
  const ctx = useRef({ draggingId, pages, reorder });
  ctx.current = { draggingId, pages, reorder };

  const onDragStart = useCallback((id: string) => setDraggingId(id), []);
  const onDragOver = useCallback((id: string) => setOverId(id), []);
  const reset = useCallback(() => {
    setDraggingId(null);
    setOverId(null);
  }, []);

  const onDrop = useCallback(
    (toId: string) => {
      const { draggingId: from, pages: p, reorder: r } = ctx.current;
      if (from && from !== toId) {
        const updates = reorderSiblings(p, from, toId);
        if (updates.length) r.mutate(updates);
      }
      reset();
    },
    [reset],
  );

  // Touch/pen path: the row's grip drives the same reorder as the native drag
  // (rows carry data-drag-id); mouse keeps native HTML5 drag.
  const pointer = usePointerDrag({ onDragStart, onDragOver, onDrop, onDragEnd: reset });

  // The handlers object is fully stable (all callbacks have empty/stable deps),
  // so it's safe to spread onto every memoized row. draggingId/overId are
  // returned separately for the parent to derive per-row booleans.
  const handlers = useMemo<PageDndHandlers>(
    () => ({
      onDragStart,
      onDragOver,
      onDrop,
      onDragEnd: reset,
      onPointerDown: pointer.onPointerDown,
    }),
    [onDragStart, onDragOver, onDrop, reset, pointer.onPointerDown],
  );

  return { draggingId, overId, handlers };
}
