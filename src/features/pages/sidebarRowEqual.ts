import type { PageNode } from './pageTree';
import type { PageDndHandlers } from './usePageDnd';

export interface SidebarRowProps {
  node: PageNode;
  depth: number;
  activeId?: string;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (id: string) => void;
  handlers: PageDndHandlers;
  draggingId: string | null;
  overId: string | null;
}

/** Whether a SidebarRow re-render can be skipped (the memo comparator). The drag
 * state (draggingId/overId) changes continuously during a drag, but only matters
 * to a row when it IS the dragged or hovered row (now or a moment ago). Skip
 * unless this row's own dragging/over status flipped, or another prop changed —
 * keeping a drag O(1) re-renders, not O(rows). Pure. */
export function sidebarRowEqual(a: SidebarRowProps, b: SidebarRowProps): boolean {
  const id = a.node.page.id;
  if (a.node !== b.node || a.depth !== b.depth || a.activeId !== b.activeId) return false;
  if (a.collapsed !== b.collapsed || a.onToggle !== b.onToggle || a.handlers !== b.handlers)
    return false;
  if (a.onAddChild !== b.onAddChild) return false;
  const wasDragging = a.draggingId === id;
  const isDragging = b.draggingId === id;
  const wasOver = a.overId === id && a.draggingId !== id;
  const isOver = b.overId === id && b.draggingId !== id;
  return wasDragging === isDragging && wasOver === isOver;
}
