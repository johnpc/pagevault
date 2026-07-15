import { useHistory } from 'react-router-dom';
import { type DragEvent } from 'react';
import { displayTitle } from './pageTree';
import type { PageNode } from './pageTree';
import type { PageDndHandlers } from './usePageDnd';

/** The single row bar for a sidebar page: drag grip, expand/collapse caret,
 * the open-page button, and a "+" that adds a sub-page under it. The recursive
 * child rendering lives in SidebarRow; this is just one row's controls. */
export function SidebarRowBar({
  node,
  depth,
  className,
  hasChildren,
  isCollapsed,
  onToggle,
  onAddChild,
  handlers,
}: {
  node: PageNode;
  depth: number;
  className: string;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggle: (id: string) => void;
  onAddChild: (id: string) => void;
  handlers: PageDndHandlers;
}) {
  const history = useHistory();
  const id = node.page.id;
  const title = displayTitle(node.page);

  return (
    <div
      className={className}
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
        aria-label={`Drag ${title} to reorder`}
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
        <span className="pv-sidebar-title">{title}</span>
      </button>
      <button
        className="pv-sidebar-add"
        aria-label={`Add a sub-page in ${title}`}
        onClick={() => onAddChild(id)}
      >
        +
      </button>
    </div>
  );
}
