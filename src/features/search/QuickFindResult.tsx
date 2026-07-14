import { Highlighted } from './Highlighted';
import type { SearchResult } from './searchResults';

/** One quick-find result row: icon + title (and an optional content snippet),
 * both query-highlighted. Clicking opens its page. Render-only. */
export function QuickFindResult({
  result,
  query,
  active,
  onOpen,
}: {
  result: SearchResult;
  query: string;
  active: boolean;
  onOpen: (pageId: string) => void;
}) {
  return (
    <li>
      <button
        className={`pv-qf-item${active ? ' pv-qf-item--active' : ''}`}
        role="option"
        aria-selected={active}
        onClick={() => onOpen(result.pageId)}
      >
        <span className="pv-qf-icon">{result.icon}</span>
        <span className="pv-qf-text">
          <span className="pv-qf-title">
            <Highlighted text={result.title} query={query} />
          </span>
          {result.snippet && (
            <span className="pv-qf-snippet pv-muted">
              <Highlighted text={result.snippet} query={query} />
            </span>
          )}
        </span>
      </button>
    </li>
  );
}
