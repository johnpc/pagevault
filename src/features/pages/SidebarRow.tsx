import { useHistory } from 'react-router-dom';
import type { PageNode } from './pageTree';
import { displayTitle } from './pageTree';

interface SidebarRowProps {
  node: PageNode;
  depth: number;
  activeId?: string;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
}

/** One page in the sidebar tree. Rows with children show a disclosure triangle
 * that expands/collapses their subtree; recurses to render children. */
export function SidebarRow({ node, depth, activeId, collapsed, onToggle }: SidebarRowProps) {
  const history = useHistory();
  const active = node.page.id === activeId;
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(node.page.id);

  return (
    <>
      <div
        className={`pv-sidebar-row${active ? ' pv-sidebar-row--active' : ''}`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            className="pv-sidebar-caret"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            aria-expanded={!isCollapsed}
            onClick={() => onToggle(node.page.id)}
          >
            {isCollapsed ? '▸' : '▾'}
          </button>
        ) : (
          <span className="pv-sidebar-caret" aria-hidden="true" />
        )}
        <button className="pv-sidebar-open" onClick={() => history.push(`/page/${node.page.id}`)}>
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
          />
        ))}
    </>
  );
}
