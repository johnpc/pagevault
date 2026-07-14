import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { BlockRecord } from '../../lib/pbClient';
import { emptyHistory, pushEdit, popUndo, popRedo, type HistoryState } from './historyStack';

/** One reversible content edit: a block's text before and after the change. */
interface ContentEdit {
  blockId: string;
  before: string;
  after: string;
}

type Patch = Partial<BlockRecord>;
type EditFn = (id: string, patch: Patch) => void;

/**
 * Document-level undo/redo for block CONTENT edits (Cmd/Ctrl+Z, Cmd/Ctrl+⇧+Z or
 * Ctrl+Y). Wraps the raw `editBlock`: the returned `editBlock` records each
 * content change (reading the pre-edit text from `blocksRef`) before delegating,
 * so callers need no extra plumbing. Content edits commit on blur (one call per
 * edit session); consecutive edits of the same block coalesce into one undo
 * step. Undo/redo reissue the RAW editBlock (not the recording wrapper) so they
 * don't re-record, and go through the normal optimistic + server path. History
 * lives in a ref (no re-renders); the keyboard is bound at the window level.
 */
export function usePageHistory(editBlock: EditFn, pageId: string): EditFn {
  const state = useRef<HistoryState<ContentEdit>>(emptyHistory());
  const qc = useQueryClient();

  const recordingEdit = useCallback<EditFn>(
    (id, patch) => {
      // Content commits on blur (one call per edit session, NOT per keystroke),
      // so each is its own undo step. Read `before` from the LIVE query cache —
      // useUpdateBlock's onMutate writes it synchronously, whereas a render-lagged
      // blocks ref would give a stale value during rapid back-to-back edits.
      if (typeof patch.content === 'string') {
        const cached = qc.getQueryData<BlockRecord[]>(['blocks', pageId]);
        const before = cached?.find((b) => b.id === id)?.content ?? '';
        if (before !== patch.content) {
          state.current = pushEdit(state.current, {
            payload: { blockId: id, before, after: patch.content },
          });
        }
      }
      editBlock(id, patch);
    },
    [editBlock, qc, pageId],
  );

  const step = useCallback(
    (redo: boolean) => {
      const r = redo ? popRedo(state.current) : popUndo(state.current);
      if (!r) return;
      state.current = r.state;
      const { blockId, before, after } = r.entry.payload;
      editBlock(blockId, { content: redo ? after : before });
    },
    [editBlock],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!(e.metaKey || e.ctrlKey) || (k !== 'z' && k !== 'y')) return;
      e.preventDefault();
      step(k === 'y' || e.shiftKey);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step]);

  return recordingEdit;
}
