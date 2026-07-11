import { useHistory } from 'react-router-dom';
import type { PageRecord } from '../../lib/pbClient';
import { favoritePages, displayTitle } from './pageTree';

/** The sidebar's pinned Favorites section (hidden when there are none). */
export function FavoritesSection({ pages, activeId }: { pages: PageRecord[]; activeId?: string }) {
  const history = useHistory();
  const favorites = favoritePages(pages);
  if (favorites.length === 0) return null;

  return (
    <nav className="pv-sidebar-section" aria-label="Favorites">
      <span className="pv-sidebar-label pv-muted">Favorites</span>
      {favorites.map((page) => (
        <div
          key={page.id}
          className={`pv-sidebar-row${page.id === activeId ? ' pv-sidebar-row--active' : ''}`}
        >
          <button className="pv-sidebar-open" onClick={() => history.push(`/page/${page.id}`)}>
            <span className="pv-sidebar-icon">{page.icon || '📄'}</span>
            <span className="pv-sidebar-title">{displayTitle(page)}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
