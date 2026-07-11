import { useComments, useDeleteComment } from './commentsApi';
import { useCommentInput } from './useCommentInput';
import { relativeTime } from '../pages/pageStats';
import './Comments.css';

/** The page comments panel: existing comments (oldest first) + a compose box.
 * Comments are owner-scoped, so this is your own private thread on the page. */
export function Comments({ pageId }: { pageId: string }) {
  const { data } = useComments(pageId);
  const del = useDeleteComment(pageId);
  const { draft, setDraft, submit, pending } = useCommentInput(pageId);
  const comments = data ?? [];

  return (
    <section className="pv-comments" aria-label="Comments">
      <h2 className="pv-comments-head pv-muted">
        {comments.length > 0 ? `Comments (${comments.length})` : 'Comments'}
      </h2>
      {comments.map((c) => (
        <div key={c.id} className="pv-comment">
          <p className="pv-comment-body">{c.body}</p>
          <div className="pv-comment-meta pv-muted">
            <span>{relativeTime(c.created, Date.now())}</span>
            <button
              className="pv-comment-del"
              aria-label="Delete comment"
              onClick={() => del.mutate(c.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      <div className="pv-comment-compose">
        <textarea
          className="pv-comment-input"
          aria-label="Add a comment"
          rows={2}
          placeholder="Add a comment…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Cmd/Ctrl+Enter posts, like Notion.
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          className="pv-comment-post"
          onClick={submit}
          disabled={pending || draft.trim() === ''}
        >
          Comment
        </button>
      </div>
    </section>
  );
}
