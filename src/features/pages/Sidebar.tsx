import { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { usePages, useCreatePage } from './pagesApi';
import { buildTree, favoritePages, displayTitle } from './pageTree';
import { readCollapsed, writeCollapsed, toggleCollapsed } from './expandStore';
import { LoadState } from '../shell/LoadState';
import { SidebarRow } from './SidebarRow';
import { useAuth } from '../auth/useAuth';
import './Sidebar.css';

/** The left rail: workspace title, search, the page tree, "New page", sign-out. */
export function Sidebar({ onSearch, onHelp }: { onSearch: () => void; onHelp: () => void }) {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const { signOut, user } = useAuth();
  const { data: pages, isLoading, isError, refetch } = usePages();
  const create = useCreatePage();
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = (pageId: string) => {
    const next = toggleCollapsed(collapsed, pageId);
    writeCollapsed(next);
    setCollapsed(next);
  };

  const newPage = async () => {
    const page = await create.mutateAsync({ siblings: pages ?? [] });
    history.push(`/page/${page.id}`);
  };

  return (
    <aside className="pv-sidebar">
      <div className="pv-sidebar-head">
        <span className="pv-heading">PageVault</span>
        <span className="pv-muted pv-sidebar-user">{user?.email}</span>
      </div>

      <button className="pv-search" onClick={onSearch}>
        <span>🔍 Search</span>
        <kbd className="pv-kbd">⌘K</kbd>
      </button>

      <button className="pv-new-page" onClick={newPage} disabled={create.isPending}>
        + New page
      </button>

      {favoritePages(pages ?? []).length > 0 && (
        <nav className="pv-sidebar-section" aria-label="Favorites">
          <span className="pv-sidebar-label pv-muted">Favorites</span>
          {favoritePages(pages ?? []).map((page) => (
            <div
              key={page.id}
              className={`pv-sidebar-row${page.id === id ? ' pv-sidebar-row--active' : ''}`}
            >
              <button className="pv-sidebar-open" onClick={() => history.push(`/page/${page.id}`)}>
                <span className="pv-sidebar-icon">{page.icon || '📄'}</span>
                <span className="pv-sidebar-title">{displayTitle(page)}</span>
              </button>
            </div>
          ))}
        </nav>
      )}

      <nav className="pv-sidebar-tree">
        <LoadState
          loading={isLoading}
          error={isError}
          empty={(pages ?? []).length === 0}
          onRetry={refetch}
          emptyTitle="No pages yet"
        >
          {buildTree(pages ?? []).map((node) => (
            <SidebarRow
              key={node.page.id}
              node={node}
              depth={0}
              activeId={id}
              collapsed={collapsed}
              onToggle={toggle}
            />
          ))}
        </LoadState>
      </nav>

      <button className="pv-signout pv-muted" onClick={() => history.push('/trash')}>
        🗑 Trash
      </button>
      <button className="pv-signout pv-muted" onClick={() => history.push('/settings')}>
        ⚙ Settings
      </button>
      <button className="pv-signout pv-muted" onClick={onHelp}>
        ⌨ Shortcuts
      </button>
      <button className="pv-signout pv-muted" onClick={signOut}>
        Sign out
      </button>
    </aside>
  );
}
