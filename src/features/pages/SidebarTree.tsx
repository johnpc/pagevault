import type { PageNode } from './pageTree';
import type { PageDnd } from './usePageDnd';
import { LoadState } from '../shell/LoadState';
import { SidebarRow } from './SidebarRow';

/** The scrollable page-tree section of the sidebar: load/error/empty states +
 * the recursive rows. Split out of Sidebar to keep it small; rows are memoized
 * (see SidebarRow) so a drag only re-renders the affected rows. */
export function SidebarTree({
  tree,
  activeId,
  collapsed,
  onToggle,
  onAddChild,
  dnd,
  isLoading,
  isError,
  isEmpty,
  onRetry,
}: {
  tree: PageNode[];
  activeId?: string;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (id: string) => void;
  dnd: PageDnd;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
}) {
  return (
    <nav className="pv-sidebar-tree">
      <LoadState
        loading={isLoading}
        error={isError}
        empty={isEmpty}
        onRetry={onRetry}
        emptyTitle="No pages yet"
        skeletonRows={6}
      >
        {tree.map((node) => (
          <SidebarRow
            key={node.page.id}
            node={node}
            depth={0}
            activeId={activeId}
            collapsed={collapsed}
            onToggle={onToggle}
            onAddChild={onAddChild}
            handlers={dnd.handlers}
            draggingId={dnd.draggingId}
            overId={dnd.overId}
          />
        ))}
      </LoadState>
    </nav>
  );
}
