import { displayTitle } from '../pages/pageTree';
import type { MentionItem } from './useMention';
import './SlashMenu.css';

/** The label + icon for one @-menu item (a page link or a date insert). */
function itemView(item: MentionItem): { icon: string; text: string } {
  if (item.kind === 'date') return { icon: '📅', text: item.date.label };
  return { icon: item.page.icon || '📄', text: displayTitle(item.page) };
}

/** A stable key for an @-menu item. */
function itemKey(item: MentionItem): string {
  return item.kind === 'date' ? `date:${item.date.key}` : `page:${item.page.id}`;
}

/** The floating @-menu shown while typing in a block: dynamic date inserts
 * (@today/@now/…) followed by matching page links. */
export function MentionMenu({
  items,
  active,
  onPick,
}: {
  items: MentionItem[];
  active: number;
  onPick: (item: MentionItem) => void;
}) {
  if (items.length === 0) return null;
  return (
    <ul className="pv-slash" role="listbox" aria-label="Insert a mention">
      {items.map((item, i) => {
        const { icon, text } = itemView(item);
        return (
          <li key={itemKey(item)}>
            <button
              type="button"
              role="option"
              aria-selected={i === active}
              className={`pv-slash-item${i === active ? ' pv-slash-item--active' : ''}`}
              // onMouseDown (not onClick) so it fires before the textarea blur.
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(item);
              }}
            >
              <span className="pv-slash-icon">{icon}</span>
              <span>{text}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
