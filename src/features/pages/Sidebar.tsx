import { useHistory, useParams } from 'react-router-dom';
import { usePages, useCreatePage } from './pagesApi';
import { buildTree } from './pageTree';
import { LoadState } from '../shell/LoadState';
import { SidebarRow } from './SidebarRow';
import { useAuth } from '../auth/useAuth';
import './Sidebar.css';

/** The left rail: workspace title, search, the page tree, "New page", sign-out. */
export function Sidebar({ onSearch }: { onSearch: () => void }) {
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const { signOut, user } = useAuth();
  const { data: pages, isLoading, isError, refetch } = usePages();
  const create = useCreatePage();

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

      <nav className="pv-sidebar-tree">
        <LoadState
          loading={isLoading}
          error={isError}
          empty={(pages ?? []).length === 0}
          onRetry={refetch}
          emptyTitle="No pages yet"
        >
          {buildTree(pages ?? []).map((node) => (
            <SidebarRow key={node.page.id} node={node} depth={0} activeId={id} />
          ))}
        </LoadState>
      </nav>

      <button className="pv-signout pv-muted" onClick={signOut}>
        Sign out
      </button>
    </aside>
  );
}
