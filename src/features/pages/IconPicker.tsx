import { useState } from 'react';
import { emojiSearch } from './emojiSearch';
import { usePopover } from '../shell/usePopover';

/** The page icon control: a button showing the current icon that opens a
 * searchable emoji grid. Choosing one sets `page.icon`; "Remove" clears it.
 * Focus-trapped + closes on Escape/outside-click via usePopover. */
export function IconPicker({ icon, onPick }: { icon: string; onPick: (icon: string) => void }) {
  const { open, setOpen, close, triggerRef, menuRef, onKeyDown } = usePopover<HTMLDivElement>();
  const [query, setQuery] = useState('');
  const results = emojiSearch(query);

  const choose = (next: string) => {
    onPick(next);
    close();
  };

  return (
    <div className="pv-icon-pick" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-icon-current"
        aria-label="Page icon"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {icon || '📄'}
      </button>
      {open && (
        <div ref={menuRef} className="pv-icon-menu" role="dialog" aria-label="Choose page icon">
          <input
            className="pv-icon-search"
            aria-label="Search icons"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="pv-icon-grid">
            {results.map((e) => (
              <button
                key={e.char}
                className={`pv-icon-choice${icon === e.char ? ' pv-icon-choice--on' : ''}`}
                aria-label={`Set icon ${e.char}`}
                onClick={() => choose(e.char)}
              >
                {e.char}
              </button>
            ))}
            {results.length === 0 && <span className="pv-icon-none pv-muted">No matches</span>}
          </div>
          <button className="pv-icon-remove pv-muted" onClick={() => choose('')}>
            Remove icon
          </button>
        </div>
      )}
    </div>
  );
}
