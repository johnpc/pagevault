import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { moveSelection, selectedIds, type BlockSelection } from './blockSelection';

interface SelectionActions {
  onDeleteMany: (ids: string[]) => void;
  onIndentMany: (ids: string[], dir: 'in' | 'out') => void;
}

/**
 * While a block selection is active the editing field is blurred, so keys land
 * on <body>. This document-level listener drives the active selection:
 *   Cmd/Ctrl+A   select every block
 *   ↑/↓          move (Shift grows/shrinks the range)
 *   Tab / Shift+Tab   indent / outdent the whole selection
 *   Backspace / Delete  delete the selected blocks
 *   Escape       clear
 * Split out of useBlockSelection to keep that hook under the line gate.
 */
export function useActiveSelectionKeys(
  sel: BlockSelection | null,
  ids: string[],
  setSel: Dispatch<SetStateAction<BlockSelection | null>>,
  actions: SelectionActions,
) {
  const { onDeleteMany, onIndentMany } = actions;
  useEffect(() => {
    if (!sel) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSel({ anchor: 0, focus: ids.length - 1 });
      } else if (e.key === 'Tab') {
        e.preventDefault();
        onIndentMany(selectedIds(sel, ids), e.shiftKey ? 'out' : 'in');
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
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
  }, [sel, ids, setSel, onDeleteMany, onIndentMany]);
}
