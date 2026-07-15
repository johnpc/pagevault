import { useRef, useState, type KeyboardEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { useSearch } from './searchApi';
import { useDebounced } from './useDebounced';
import { nextActiveIndex } from './searchResults';
import { QuickFindResult } from './QuickFindResult';
import { LoadState } from '../shell/LoadState';
import { useDialogFocusTrap } from '../shell/useDialogFocusTrap';
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
  // Debounce the backend search so typing "hello" fires one query, not five —
  // the input stays bound to `query` (instant), the fetch waits for it to settle.
  const debounced = useDebounced(query);
  const { data, isLoading, isError, refetch } = useSearch(debounced);
  const results = data ?? [];
  // Trap Tab within the dialog so focus can't wander to the page behind it.
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocusTrap(dialogRef, true);

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
        ref={dialogRef}
        className="pv-qf"
        role="dialog"
        aria-modal="true"
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
                  <QuickFindResult
                    key={`${r.pageId}-${r.kind}`}
                    result={r}
                    query={query}
                    active={i === active}
                    onOpen={go}
                  />
                ))}
              </ul>
            </LoadState>
          </div>
        )}
      </div>
    </div>
  );
}
