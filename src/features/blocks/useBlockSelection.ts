import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import {
  moveSelection,
  selectedIds,
  isSelected,
  indexAfterDelete,
  type BlockSelection,
} from './blockSelection';
import { handoffSelection } from './selectionHandoff';

/**
 * Keyboard multi-block selection for the block list (Notion-style).
 *
 * The handoff starts from a textarea: Shift+↓ at the caret END (or Shift+↑ at
 * the START) selects the current + next row and BLURS the field. The container
 * onKeyDown catches that (the textarea bubbles to it). Once active the field is
 * blurred, so keys land on <body> — a document-level listener then drives:
 *   ↑/↓         move the selection (collapse to one block)
 *   Shift+↑/↓   grow/shrink it
 *   Backspace / Delete  delete every selected block
 *   Escape      clear it
 *
 * `ids` is the visible block ids in order; each row is marked data-block-index
 * so a handoff knows its position.
 */
export function useBlockSelection(ids: string[], onDeleteMany: (ids: string[]) => void) {
  const [sel, setSel] = useState<BlockSelection | null>(null);
  const clear = useCallback(() => setSel(null), []);

  // Container keydown: only the textarea→selection handoff lives here.
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const el = e.target;
      if (sel || !(el instanceof HTMLTextAreaElement)) return;
      const next = handoffSelection(e, el, ids.length);
      if (!next) return;
      e.preventDefault();
      // Stop the native event before it bubbles to document: the selection's own
      // document keydown listener (added by the effect below on this same commit)
      // would otherwise catch this very keypress and move the focus a second time.
      e.nativeEvent.stopImmediatePropagation();
      el.blur();
      setSel(next);
    },
    [sel, ids],
  );

  // While active, own the nav/delete keys at the document level (the field is
  // blurred, so events no longer reach the container).
  useEffect(() => {
    if (!sel) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) =>
          s ? moveSelection(s, e.key === 'ArrowDown' ? 1 : -1, e.shiftKey, ids.length) : s,
        );
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        onDeleteMany(selectedIds(sel, ids));
        setSel(null);
      } else if (e.key === 'Escape') {
        setSel(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sel, ids, onDeleteMany]);

  return {
    active: sel !== null,
    onKeyDown,
    clear,
    selectedAt: (index: number) => (sel ? isSelected(sel, index) : false),
    caretIndexAfterDelete: () => (sel ? indexAfterDelete(sel) : 0),
  };
}
