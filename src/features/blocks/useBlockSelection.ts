import { useCallback, useState, type KeyboardEvent } from 'react';
import { isSelected, indexAfterDelete, selectedIds, type BlockSelection } from './blockSelection';
import { handoffSelection, isSelectAllBlocks } from './selectionHandoff';
import { useActiveSelectionKeys } from './useActiveSelectionKeys';
import { useSelectionActions } from './useSelectionActions';
import { useSelectionStart } from './useSelectionStart';
import { handleMoveBlockKey } from './moveBlockKey';
import type { BlockType } from '../../lib/pbTypes';

/** Multi-block selection (Notion-style): Shift+Arrow/Shift+Click/⋮⋮-click start
 * it; useActiveSelectionKeys drives move/indent/delete/duplicate/copy/turn/color.
 * onMoveBlock is single-block ⌘⇧↑/↓. */
interface SelectionActions {
  onDeleteMany: (ids: string[]) => void;
  onIndentMany: (ids: string[], dir: 'in' | 'out') => void;
  onDuplicateMany?: (ids: string[]) => void;
  onMoveBlock?: (fromId: string, toId: string) => void;
  onColorMany?: (ids: string[], color: string) => void;
  onTypeMany?: (ids: string[], type: BlockType) => void;
  onCopyMany?: (ids: string[]) => void;
}

export function useBlockSelection(ids: string[], actions: SelectionActions) {
  const [sel, setSel] = useState<BlockSelection | null>(null);
  const clear = useCallback(() => setSel(null), []);
  const { noteFocus, shiftClick, selectAll, selectId } = useSelectionStart(ids, setSel);

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
    selectId,
    noteFocus,
    ...barActions, // colorSelected, deleteSelected
    selectedAt: (index: number) => (sel ? isSelected(sel, index) : false),
    caretIndexAfterDelete: () => (sel ? indexAfterDelete(sel) : 0),
  };
}
