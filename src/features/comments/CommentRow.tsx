import { useState } from 'react';
import type { CommentRecord } from '../../lib/pbClient';
import { relativeTime } from '../pages/pageStats';

/** One comment in the thread. Shows the body + a relative timestamp with Edit /
 * Delete actions; Edit swaps the body for an inline textarea (Cmd/Ctrl+Enter or
 * Save commits, Escape/Cancel reverts). Owns only its local edit state so the
 * panel stays a thin list. `now` is injected so the timestamp is deterministic. */
export function CommentRow({
  comment,
  now,
  onSave,
  onDelete,
}: {
  comment: CommentRecord;
  now: number;
  onSave: (id: string, body: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);

  const commit = () => {
    const body = draft.trim();
    if (body && body !== comment.body) onSave(comment.id, body);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(comment.body);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="pv-comment">
        <textarea
          className="pv-comment-input"
          aria-label="Edit comment text"
          rows={2}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              commit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
        />
        <div className="pv-comment-meta">
          <button className="pv-comment-save" onClick={commit}>
            Save
          </button>
          <button className="pv-comment-cancel pv-muted" onClick={cancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-comment">
      <p className="pv-comment-body">{comment.body}</p>
      <div className="pv-comment-meta pv-muted">
        <span>{relativeTime(comment.created, now)}</span>
        <button
          className="pv-comment-edit"
          aria-label="Edit comment"
          onClick={() => {
            setDraft(comment.body);
            setEditing(true);
          }}
        >
          Edit
        </button>
        <button
          className="pv-comment-del"
          aria-label="Delete comment"
          onClick={() => onDelete(comment.id)}
        >
          ×
        </button>
      </div>
    </div>
  );
}
