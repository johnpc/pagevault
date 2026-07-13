import { useState } from 'react';
import { usePages } from '../pages/pagesApi';
import { displayTitle } from '../pages/pageTree';

/** A relation cell: links the row to a page. Stores the page id as its value;
 * renders that page's title with a popover to pick a different page or clear it.
 * Reuses the react-query-cached usePages, so many relation cells share one fetch. */
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
  const [open, setOpen] = useState(false);
  const linked = (pages.data ?? []).find((p) => p.id === value);
  const text = linked ? displayTitle(linked) : '';

  return (
    <div className="pv-relation">
      <button
        className="pv-relation-btn"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {text ? (
          <span className="pv-relation-chip">{text}</span>
        ) : (
          <span className="pv-muted">—</span>
        )}
      </button>
      {open && (
        <ul className="pv-relation-menu" role="listbox" aria-label={`${label} link a page`}>
          {value && (
            <li>
              <button
                type="button"
                className="pv-relation-item pv-relation-clear"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
              >
                Clear
              </button>
            </li>
          )}
          {(pages.data ?? []).map((p) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={p.id === value}
                className={`pv-relation-item${p.id === value ? ' pv-relation-item--on' : ''}`}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
              >
                {displayTitle(p)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
