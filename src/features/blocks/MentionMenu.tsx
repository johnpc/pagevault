import type { PageRecord } from '../../lib/pbClient';
import { displayTitle } from '../pages/pageTree';
import './SlashMenu.css';

/** The floating page picker shown while typing an @-mention in a block. */
export function MentionMenu({
  pages,
  active,
  onPick,
}: {
  pages: PageRecord[];
  active: number;
  onPick: (page: PageRecord) => void;
}) {
  if (pages.length === 0) return null;
  return (
    <ul className="pv-slash" role="listbox" aria-label="Link a page">
      {pages.map((page, i) => (
        <li key={page.id}>
          <button
            type="button"
            role="option"
            aria-selected={i === active}
            className={`pv-slash-item${i === active ? ' pv-slash-item--active' : ''}`}
            // onMouseDown (not onClick) so it fires before the textarea blur.
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(page);
            }}
          >
            <span className="pv-slash-icon">{page.icon || '📄'}</span>
            <span>{displayTitle(page)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
