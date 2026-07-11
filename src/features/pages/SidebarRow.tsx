import { useHistory } from 'react-router-dom';
import type { DragEvent } from 'react';
import type { PageNode } from './pageTree';
import { displayTitle } from './pageTree';
import type { PageDndHandlers } from './usePageDnd';

interface SidebarRowProps {
  node: PageNode;
  depth: number;
  activeId?: string;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  dnd: PageDndHandlers;
}

/** One page in the sidebar tree. Rows with children show a disclosure triangle
 * that expands/collapses their subtree; recurses to render children. Each row is
 * draggable + a drop target for reordering among its siblings. */
export function SidebarRow({ node, depth, activeId, collapsed, onToggle, dnd }: SidebarRowProps) {
  const history = useHistory();
  const id = node.page.id;
  const active = id === activeId;
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(id);
  const over = dnd.overId === id && dnd.draggingId !== id;
  const cls =
    `pv-sidebar-row${active ? ' pv-sidebar-row--active' : ''}` +
    (dnd.draggingId === id ? ' pv-sidebar-row--dragging' : '') +
    (over ? ' pv-sidebar-row--over' : '');

  return (
    <>
      <div
        className={cls}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        draggable
        onDragStart={() => dnd.onDragStart(id)}
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          dnd.onDragOver(id);
        }}
        onDrop={(e: DragEvent) => {
          e.preventDefault();
          dnd.onDrop(id);
        }}
        onDragEnd={dnd.onDragEnd}
      >
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
            dnd={dnd}
          />
        ))}
    </>
  );
}
