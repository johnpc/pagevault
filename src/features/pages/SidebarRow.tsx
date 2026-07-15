import { memo } from 'react';
import { sidebarRowEqual, type SidebarRowProps } from './sidebarRowEqual';
import { SidebarRowBar } from './SidebarRowBar';

/** One page in the sidebar tree. Rows with children show a disclosure triangle
 * that expands/collapses their subtree; recurses to render children. Each row is
 * draggable + a drop target for reordering among its siblings, and carries a "+"
 * to add a sub-page under it (see SidebarRowBar). */
function SidebarRowInner({
  node,
  depth,
  activeId,
  collapsed,
  onToggle,
  onAddChild,
  handlers,
  draggingId,
  overId,
}: SidebarRowProps) {
  const id = node.page.id;
  const active = id === activeId;
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(id);
  const dragging = draggingId === id;
  const over = overId === id && draggingId !== id;
  const cls =
    `pv-sidebar-row${active ? ' pv-sidebar-row--active' : ''}` +
    (dragging ? ' pv-sidebar-row--dragging' : '') +
    (over ? ' pv-sidebar-row--over' : '');

  return (
    <>
      <SidebarRowBar
        node={node}
        depth={depth}
        className={cls}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        onToggle={onToggle}
        onAddChild={onAddChild}
        handlers={handlers}
      />
      {hasChildren &&
        !isCollapsed &&
        node.children.map((child) => (
          <SidebarRow
            key={child.page.id}
            node={child}
            depth={depth + 1}
            activeId={activeId}
            collapsed={collapsed}
            onToggle={onToggle}
            onAddChild={onAddChild}
            handlers={handlers}
            draggingId={draggingId}
            overId={overId}
          />
        ))}
    </>
  );
}

/** Memoized with a drag-aware comparator (areEqual) so a drag's continuous
 * overId/draggingId updates only re-render the two rows whose dragging/over
 * status flips — not the whole tree. The handlers bag + collapsed set + onToggle
 * are referentially stable (see usePageDnd / Sidebar). */
export const SidebarRow = memo(SidebarRowInner, sidebarRowEqual);
