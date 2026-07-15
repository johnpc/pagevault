import { useComments, useDeleteComment, useUpdateComment } from './commentsApi';
import { useCommentInput } from './useCommentInput';
import { CommentRow } from './CommentRow';
import './Comments.css';

/** The page comments panel: existing comments (oldest first) + a compose box.
 * Comments are owner-scoped, so this is your own private thread on the page. */
export function Comments({ pageId }: { pageId: string }) {
  const { data, isLoading, isError } = useComments(pageId);
  const del = useDeleteComment(pageId);
  const edit = useUpdateComment(pageId);
  const { draft, setDraft, submit, pending } = useCommentInput(pageId);
  const comments = data ?? [];
  const now = Date.now();
  // A one-line status under the header for the non-content outcomes; the compose
  // box below always stays available so you can post regardless.
  const status = isError
    ? 'Couldn’t load comments.'
    : isLoading
      ? 'Loading…'
      : comments.length === 0
        ? 'No comments yet — start the thread below.'
        : null;

  return (
    <section className="pv-comments" aria-label="Comments">
      <h2 className="pv-comments-head pv-muted">
        {comments.length > 0 ? `Comments (${comments.length})` : 'Comments'}
      </h2>
      {status && <p className="pv-comments-status pv-muted">{status}</p>}
      {comments.map((c) => (
        <CommentRow
          key={c.id}
          comment={c}
          now={now}
          onSave={(id, body) => edit.mutate({ id, body })}
          onDelete={(id) => del.mutate(id)}
        />
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
