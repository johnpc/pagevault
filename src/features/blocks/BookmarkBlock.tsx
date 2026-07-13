import { useState } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { normalizeUrl, urlDomain } from './bookmarkUrl';

/** A bookmark block: a link card for a URL (stored in `content`). Empty or when
 * editing, it shows a URL input; otherwise a card with the domain + full link
 * that opens in a new tab. Clicking the card's edit affordance re-opens the
 * input. (No server-side metadata fetch — honest domain/URL card.) */
export function BookmarkBlock({
  block,
  onEdit,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
}) {
  const [editing, setEditing] = useState(block.content.trim() === '');
  const [url, setUrl] = useState(block.content);

  const save = () => {
    const next = normalizeUrl(url);
    setEditing(false);
    if (next !== block.content) onEdit(block.id, { content: next });
  };

  if (editing || block.content.trim() === '') {
    return (
      <div className="pv-bookmark-edit">
        <input
          className="pv-block-input"
          aria-label="Bookmark URL"
          placeholder="Paste a link to bookmark…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />
      </div>
    );
  }

  const href = normalizeUrl(block.content);
  return (
    <div className="pv-bookmark">
      <a className="pv-bookmark-link" href={href} target="_blank" rel="noopener noreferrer">
        <span className="pv-bookmark-domain">{urlDomain(block.content)}</span>
        <span className="pv-bookmark-url">{href}</span>
      </a>
      <button
        className="pv-bookmark-edit-btn"
        aria-label="Edit bookmark"
        onClick={() => setEditing(true)}
      >
        ✎
      </button>
    </div>
  );
}
