import { forwardRef, useCallback, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { usePages, useCreatePage } from './pagesApi';
import { buildTree } from './pageTree';
import { FavoritesSection } from './FavoritesSection';
import { readCollapsed, writeCollapsed, toggleCollapsed } from './expandStore';
import { SidebarTree } from './SidebarTree';
import { useAddChildPage } from './useAddChildPage';
import { usePageDnd } from './usePageDnd';
import { useAuth } from '../auth/useAuth';
import { SidebarFooter } from './SidebarFooter';
import './Sidebar.css';

interface SidebarProps {
  onSearch: () => void;
  onHelp: () => void;
}

/** The left rail: workspace title, search, the page tree, "New page", sign-out.
 * Ref-forwarded to its <aside> so the mobile drawer can focus-trap it. */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { onSearch, onHelp },
  ref,
) {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const { data: pages, isLoading, isError, refetch } = usePages();
  const create = useCreatePage();
  const dnd = usePageDnd(pages ?? []);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  // Rebuild the tree only when the page list changes — not on every route
  // change, drag-hover, or collapse toggle that re-renders the sidebar.
  const tree = useMemo(() => buildTree(pages ?? []), [pages]);

  // Stable identity (functional update) so it doesn't bust the memoized
  // SidebarRow on every drag-hover / route re-render of the sidebar.
  const toggle = useCallback((pageId: string) => {
    setCollapsed((prev) => {
      const next = toggleCollapsed(prev, pageId);
      writeCollapsed(next);
      return next;
    });
  }, []);

  const newPage = async () => {
    const page = await create.mutateAsync({ siblings: pages ?? [] });
    history.push(`/page/${page.id}`);
  };

  const onAddChild = useAddChildPage(pages, create, history, setCollapsed);

  return (
    <aside className="pv-sidebar" ref={ref}>
      <div className="pv-sidebar-head">
        <span className="pv-heading">PageVault</span>
        <span className="pv-muted pv-sidebar-user">{user?.email}</span>
      </div>

      <button className="pv-search" onClick={onSearch} aria-label="Search">
        <span>
          🔍 <span className="pv-label">Search</span>
        </span>
        <kbd className="pv-kbd">⌘K</kbd>
      </button>

      <button
        className="pv-new-page"
        onClick={newPage}
        disabled={create.isPending}
        aria-label="New page"
      >
        + <span className="pv-label">New page</span>
      </button>

      <FavoritesSection pages={pages ?? []} activeId={id} />

      <SidebarTree
        tree={tree}
        activeId={id}
        collapsed={collapsed}
        onToggle={toggle}
        onAddChild={onAddChild}
        dnd={dnd}
        isLoading={isLoading}
        isError={isError}
        isEmpty={(pages ?? []).length === 0}
        onRetry={refetch}
      />

      <SidebarFooter onHelp={onHelp} />
    </aside>
  );
});
