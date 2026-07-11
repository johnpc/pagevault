import { useState, type KeyboardEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { useSearch } from './searchApi';
import { nextActiveIndex } from './searchResults';
import { LoadState } from '../shell/LoadState';
import './QuickFind.css';

interface QuickFindProps {
  onClose: () => void;
}

/** The Cmd/Ctrl-K quick-find overlay: search pages by title + blocks by
 * content. Arrow keys move the selection; Enter opens it; click also works. */
export function QuickFind({ onClose }: QuickFindProps) {
  const history = useHistory();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const { data, isLoading, isError, refetch } = useSearch(query);
  const results = data ?? [];

  const go = (pageId: string) => {
    onClose();
    history.push(`/page/${pageId}`);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => nextActiveIndex(a, results.length, e.key === 'ArrowDown' ? 'down' : 'up'));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active].pageId);
    }
  };

  return (
    <div className="pv-qf-backdrop" onClick={onClose}>
      <div
        className="pv-qf"
        role="dialog"
        aria-label="Quick find"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          className="pv-qf-input"
          type="search"
          autoFocus
          aria-label="Search pages"
          placeholder="Search pages and content…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        {query.trim() && (
          <div className="pv-qf-results">
            <LoadState
              loading={isLoading}
              error={isError}
              empty={results.length === 0}
              onRetry={refetch}
              emptyTitle="No matches"
            >
              <ul role="listbox" aria-label="Search results">
                {results.map((r, i) => (
                  <li key={`${r.pageId}-${r.kind}`}>
                    <button
                      className={`pv-qf-item${i === active ? ' pv-qf-item--active' : ''}`}
                      role="option"
                      aria-selected={i === active}
                      onClick={() => go(r.pageId)}
                    >
                      <span className="pv-qf-icon">{r.icon}</span>
                      <span className="pv-qf-text">
                        <span className="pv-qf-title">{r.title}</span>
                        {r.snippet && <span className="pv-qf-snippet pv-muted">{r.snippet}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </LoadState>
          </div>
        )}
      </div>
    </div>
  );
}
