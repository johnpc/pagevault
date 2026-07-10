import { useHistory } from 'react-router-dom';
import { usePages } from './pagesApi';
import { ancestorPath, displayTitle } from './pageTree';
import './Breadcrumbs.css';

/** The ancestor trail above a page (root → … → current). Each crumb but the
 * last navigates to that ancestor. Renders nothing for a top-level page. */
export function Breadcrumbs({ pageId }: { pageId: string }) {
  const history = useHistory();
  const { data: pages } = usePages();
  const path = ancestorPath(pages ?? [], pageId);
  if (path.length <= 1) return null;

  return (
    <nav className="pv-crumbs" aria-label="Breadcrumb" data-testid="breadcrumb">
      {path.map((page, i) => {
        const last = i === path.length - 1;
        return (
          <span key={page.id} className="pv-crumb">
            <button
              className="pv-crumb-link"
              disabled={last}
              aria-current={last ? 'page' : undefined}
              onClick={() => history.push(`/page/${page.id}`)}
            >
              {page.icon || '📄'} {displayTitle(page)}
            </button>
            {!last && <span className="pv-crumb-sep">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
