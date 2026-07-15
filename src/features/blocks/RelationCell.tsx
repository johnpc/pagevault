import { useState } from 'react';
import { usePages } from '../pages/pagesApi';
import { displayTitle } from '../pages/pageTree';
import { usePopover } from '../shell/usePopover';
import { relationMatches } from './relationMatches';

/** A relation cell: links the row to a page. Stores the page id as its value;
 * renders that page's title with a popover to search + pick a different page or
 * clear it. Reuses react-query-cached usePages, so many relation cells share one
 * fetch; usePopover gives Escape/outside-click close + focus trap. */
export function RelationCell({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
  const pages = usePages();
  const { open, setOpen, close, triggerRef, menuRef, onKeyDown } = usePopover<HTMLDivElement>();
  const [query, setQuery] = useState('');
  const linked = (pages.data ?? []).find((p) => p.id === value);
  const text = linked ? displayTitle(linked) : '';
  // A non-empty value with no matching page = a dangling link (target deleted/
  // archived). Show it as broken + clearable, not silently blank. Wait for the
  // fetch to settle so we don't flash "broken" before pages load.
  const broken = !linked && value !== '' && !pages.isLoading;
  const pick = (id: string) => {
    onChange(id);
    close();
  };

  return (
    <div className="pv-relation" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-relation-btn"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {text ? (
          <span className="pv-relation-chip">{text}</span>
        ) : broken ? (
          <span className="pv-relation-broken" title="Linked page was deleted">
            ⚠ Broken link
          </span>
        ) : (
          <span className="pv-muted">—</span>
        )}
      </button>
      {open && (
        <div ref={menuRef} className="pv-relation-menu" aria-label={`${label} link a page`}>
          <input
            type="text"
            className="pv-relation-search"
            aria-label={`Search pages to link in ${label}`}
            placeholder="Search pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul role="listbox" aria-label={`${label} pages`}>
            {value && (
              <li>
                <button
                  type="button"
                  className="pv-relation-item pv-relation-clear"
                  onClick={() => pick('')}
                >
                  Clear
                </button>
              </li>
            )}
            {relationMatches(pages.data ?? [], query).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={p.id === value}
                  className={`pv-relation-item${p.id === value ? ' pv-relation-item--on' : ''}`}
                  onClick={() => pick(p.id)}
                >
                  {displayTitle(p)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
