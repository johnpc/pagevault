import { useEffect, useRef } from 'react';
import { Highlighted } from './Highlighted';
import type { SearchResult } from './searchResults';

/** One quick-find result row: icon + title (and an optional content snippet),
 * both query-highlighted. Clicking opens its page. When it becomes the active
 * (arrow-selected) row it scrolls itself into view so a keyboard selection never
 * slips below the fold of the scrollable results list. */
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
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return (
    <li>
      <button
        ref={ref}
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
