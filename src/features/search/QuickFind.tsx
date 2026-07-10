import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSearch } from './searchApi';
import { LoadState } from '../shell/LoadState';
import './QuickFind.css';

interface QuickFindProps {
  onClose: () => void;
}

/** The Cmd/Ctrl-K quick-find overlay: search pages by title + blocks by
 * content, click a result to open its page. Render-only; state is local. */
export function QuickFind({ onClose }: QuickFindProps) {
  const history = useHistory();
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, refetch } = useSearch(query);
  const results = data ?? [];

  const go = (pageId: string) => {
    onClose();
    history.push(`/page/${pageId}`);
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
          onChange={(e) => setQuery(e.target.value)}
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
                {results.map((r) => (
                  <li key={`${r.pageId}-${r.kind}`}>
                    <button className="pv-qf-item" role="option" onClick={() => go(r.pageId)}>
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
