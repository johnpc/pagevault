import { useHistory } from 'react-router-dom';
import type { PageNode } from './pageTree';
import { displayTitle } from './pageTree';

/** One page in the sidebar tree; recurses to render nested children. */
export function SidebarRow({
  node,
  depth,
  activeId,
}: {
  node: PageNode;
  depth: number;
  activeId?: string;
}) {
  const history = useHistory();
  const active = node.page.id === activeId;
  return (
    <>
      <button
        className={`pv-sidebar-row${active ? ' pv-sidebar-row--active' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => history.push(`/page/${node.page.id}`)}
      >
        <span className="pv-sidebar-icon">{node.page.icon || '📄'}</span>
        <span className="pv-sidebar-title">{displayTitle(node.page)}</span>
      </button>
      {node.children.map((child) => (
        <SidebarRow key={child.page.id} node={child} depth={depth + 1} activeId={activeId} />
      ))}
    </>
  );
}
