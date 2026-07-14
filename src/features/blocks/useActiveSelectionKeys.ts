import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { moveSelection, selectedIds, type BlockSelection } from './blockSelection';

/**
 * While a block selection is active the editing field is blurred, so keys land
 * on <body>. This document-level listener drives the active selection:
 *   Cmd/Ctrl+A   select every block
 *   ↑/↓          move (Shift grows/shrinks the range)
 *   Backspace / Delete  delete the selected blocks
 *   Escape       clear
 * Split out of useBlockSelection to keep that hook under the line gate.
 */
export function useActiveSelectionKeys(
  sel: BlockSelection | null,
  ids: string[],
  setSel: Dispatch<SetStateAction<BlockSelection | null>>,
  onDeleteMany: (ids: string[]) => void,
) {
  useEffect(() => {
    if (!sel) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSel({ anchor: 0, focus: ids.length - 1 });
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
  }, [sel, ids, setSel, onDeleteMany]);
}
