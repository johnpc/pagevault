import { useHistory } from 'react-router-dom';
import { memo, type DragEvent } from 'react';
import { displayTitle } from './pageTree';
import { sidebarRowEqual, type SidebarRowProps } from './sidebarRowEqual';

/** One page in the sidebar tree. Rows with children show a disclosure triangle
 * that expands/collapses their subtree; recurses to render children. Each row is
 * draggable + a drop target for reordering among its siblings. */
function SidebarRowInner({
  node,
  depth,
  activeId,
  collapsed,
  onToggle,
  handlers,
  draggingId,
  overId,
}: SidebarRowProps) {
  const history = useHistory();
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
      <div
        className={cls}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        data-drag-id={id}
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          handlers.onDragOver(id);
        }}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          handlers.onDrop(id);
        }}
        onDragEnd={handlers.onDragEnd}
      >
        <button
          className="pv-sidebar-grip"
          aria-label={`Drag ${displayTitle(node.page)} to reorder`}
          draggable
          onDragStart={() => handlers.onDragStart(id)}
          onPointerDown={handlers.onPointerDown(id)}
        >
          ⋮⋮
        </button>
        {hasChildren ? (
          <button
            className="pv-sidebar-caret"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            aria-expanded={!isCollapsed}
            onClick={() => onToggle(id)}
          >
            {isCollapsed ? '▸' : '▾'}
          </button>
        ) : (
          <span className="pv-sidebar-caret" aria-hidden="true" />
        )}
        <button className="pv-sidebar-open" onClick={() => history.push(`/page/${id}`)}>
          <span className="pv-sidebar-icon">{node.page.icon || '📄'}</span>
          <span className="pv-sidebar-title">{displayTitle(node.page)}</span>
        </button>
      </div>
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
