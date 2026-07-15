import { useCallback, useRef, useState, type KeyboardEvent } from 'react';
import {
  isSelected,
  indexAfterDelete,
  selectionFromShiftClick,
  selectedIds,
  type BlockSelection,
} from './blockSelection';
import { handoffSelection, isSelectAllBlocks } from './selectionHandoff';
import { useActiveSelectionKeys } from './useActiveSelectionKeys';
import { useSelectionActions } from './useSelectionActions';
import { handleMoveBlockKey } from './moveBlockKey';
import type { BlockType } from '../../lib/pbTypes';

/**
 * Keyboard multi-block selection (Notion-style). A Shift+Arrow at a caret edge
 * (or Shift+Click) blurs the field and starts a block selection; a document-level
 * listener (useActiveSelectionKeys) then drives ↑/↓ move, Shift+↑/↓ grow,
 * Backspace/Delete, and Escape. `ids` is the visible block ids in order.
 */
// Operations over a block selection: delete/indent (keyboard), plus the bar's
// duplicate/color/turn-into. onMoveBlock is the single-block Cmd/Ctrl+Shift+↑/↓.
interface SelectionActions {
  onDeleteMany: (ids: string[]) => void;
  onIndentMany: (ids: string[], dir: 'in' | 'out') => void;
  onDuplicateMany?: (ids: string[]) => void;
  onMoveBlock?: (fromId: string, toId: string) => void;
  onColorMany?: (ids: string[], color: string) => void;
  onTypeMany?: (ids: string[], type: BlockType) => void;
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

  // Container keydown from a block textarea: block-move (Cmd/Ctrl+Shift+↑/↓),
  // select-all escalation (Cmd/Ctrl+A), and the Shift+Arrow selection handoff.
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const el = e.target;
      if (sel || !(el instanceof HTMLTextAreaElement)) return;
      if (handleMoveBlockKey(e, el, ids, actions.onMoveBlock)) return;
      if (isSelectAllBlocks(e, el.value, el.selectionStart, el.selectionEnd)) {
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        selectAll();
        return;
      }
      const next = handoffSelection(e, el, ids.length);
      if (!next) return;
      e.preventDefault();
      // Stop before it bubbles to document, or the selection's own keydown
      // listener catches this same press and moves focus a second time.
      e.nativeEvent.stopImmediatePropagation();
      el.blur();
      setSel(next);
    },
    [sel, ids, selectAll, actions],
  );

  // While active, own the nav/delete/indent/select-all keys at the document level.
  useActiveSelectionKeys(sel, ids, setSel, actions);

  // The selected block ids (in order) — powers the action bar + its operations.
  const chosen = sel ? selectedIds(sel, ids) : [];
  const barActions = useSelectionActions(chosen, clear, actions);

  return {
    active: sel !== null,
    count: chosen.length,
    onKeyDown,
    clear,
    shiftClick,
    noteFocus,
    ...barActions, // colorSelected, deleteSelected
    selectedAt: (index: number) => (sel ? isSelected(sel, index) : false),
    caretIndexAfterDelete: () => (sel ? indexAfterDelete(sel) : 0),
  };
}
