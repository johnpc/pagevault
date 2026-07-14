import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import {
  isSelected,
  indexAfterDelete,
  selectionFromShiftClick,
  type BlockSelection,
} from './blockSelection';
import { handoffSelection, isSelectAllBlocks } from './selectionHandoff';
import { useActiveSelectionKeys } from './useActiveSelectionKeys';

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
 * Shift+Click on a block also selects the range from the focused/anchor block to
 * the clicked one (the standard editor gesture) — see `shiftClick`.
 *
 * `ids` is the visible block ids in order; each row is marked data-block-index
 * so a handoff knows its position.
 */
interface SelectionActions {
  onDeleteMany: (ids: string[]) => void;
  onIndentMany: (ids: string[], dir: 'in' | 'out') => void;
}

export function useBlockSelection(ids: string[], actions: SelectionActions) {
  const [sel, setSel] = useState<BlockSelection | null>(null);
  const clear = useCallback(() => setSel(null), []);
  // The block index most recently focused (a textarea got focus) — the anchor a
  // Shift+Click extends from when no selection is active yet.
  const focusedIndex = useRef<number | null>(null);
  const noteFocus = useCallback((index: number) => {
    focusedIndex.current = index;
  }, []);

  // Shift+Click a block: start/extend the selection to that block and blur any
  // field so the document listener owns subsequent nav/delete keys.
  const shiftClick = useCallback((index: number) => {
    setSel((s) => selectionFromShiftClick(s, index, focusedIndex.current));
    (document.activeElement as HTMLElement | null)?.blur();
  }, []);

  // Select every block (Cmd/Ctrl+A escalation) and blur the field.
  const selectAll = useCallback(() => {
    if (ids.length === 0) return;
    setSel({ anchor: 0, focus: ids.length - 1 });
    (document.activeElement as HTMLElement | null)?.blur();
  }, [ids.length]);

  // Container keydown: the textarea→selection handoff (Shift+Arrow) and the
  // Cmd/Ctrl+A "select all blocks" escalation live here.
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const el = e.target;
      if (sel || !(el instanceof HTMLTextAreaElement)) return;
      if (isSelectAllBlocks(e, el.value, el.selectionStart, el.selectionEnd)) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        selectAll();
        return;
      }
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
    [sel, ids, selectAll],
  );

  // While active, own the nav/delete/indent/select-all keys at the document level.
  useActiveSelectionKeys(sel, ids, setSel, actions);

  return {
    active: sel !== null,
    onKeyDown,
    clear,
    shiftClick,
    noteFocus,
    selectedAt: (index: number) => (sel ? isSelected(sel, index) : false),
    caretIndexAfterDelete: () => (sel ? indexAfterDelete(sel) : 0),
  };
}
