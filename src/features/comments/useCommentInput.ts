import { useState } from 'react';
import { useAddComment } from './commentsApi';

/** Compose-box state for adding a page comment: the draft text and a submit that
 * posts a non-empty (trimmed) comment then clears. Keeps the panel render-only. */
export function useCommentInput(pageId: string) {
  const [draft, setDraft] = useState('');
  const add = useAddComment(pageId);

  const submit = () => {
    const body = draft.trim();
    if (!body || add.isPending) return;
    add.mutate(body, { onSuccess: () => setDraft('') });
  };

  return { draft, setDraft, submit, pending: add.isPending };
}
