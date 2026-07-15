import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { moveSelection, selectedIds, type BlockSelection } from './blockSelection';
import { selectionKeyAction } from './selectionKeyAction';

interface SelectionActions {
  onDeleteMany: (ids: string[]) => void;
  onIndentMany: (ids: string[], dir: 'in' | 'out') => void;
  onDuplicateMany?: (ids: string[]) => void;
  onCopyMany?: (ids: string[]) => void;
}

/** Apply a classified selection keypress: mutate the selection or fire an action
 * over the selected ids. Top-level (not nested in the effect) so the hook stays
 * a thin listener and this stays under the complexity gate. */
function applyKey(
  e: KeyboardEvent,
  sel: BlockSelection,
  ids: string[],
  setSel: Dispatch<SetStateAction<BlockSelection | null>>,
  actions: SelectionActions,
) {
  const action = selectionKeyAction(e);
  if (!action) return;
  if (action.kind !== 'clear') e.preventDefault();
  if (action.kind === 'selectAll') setSel({ anchor: 0, focus: ids.length - 1 });
  else if (action.kind === 'duplicate') actions.onDuplicateMany?.(selectedIds(sel, ids));
  else if (action.kind === 'copy')
    actions.onCopyMany?.(selectedIds(sel, ids)); // keep selection
  else if (action.kind === 'cut') {
    const chosen = selectedIds(sel, ids);
    actions.onCopyMany?.(chosen);
    actions.onDeleteMany(chosen);
    setSel(null);
  } else if (action.kind === 'indent') actions.onIndentMany(selectedIds(sel, ids), action.dir);
  else if (action.kind === 'move')
    setSel((s) => (s ? moveSelection(s, action.delta, action.grow, ids.length) : s));
  else if (action.kind === 'delete') {
    actions.onDeleteMany(selectedIds(sel, ids));
    setSel(null);
  } else setSel(null); // clear
}

/**
 * While a block selection is active the editing field is blurred, so keys land
 * on <body>. This document-level listener drives the active selection:
 *   Cmd/Ctrl+A   select every block
 *   Cmd/Ctrl+C   copy the selected blocks to the clipboard (as Markdown)
 *   Cmd/Ctrl+X   cut — copy the selected blocks, then delete them
 *   Cmd/Ctrl+D   duplicate the selected blocks (as a run below the last)
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
  useEffect(() => {
    if (!sel) return;
    const handler = (e: KeyboardEvent) => applyKey(e, sel, ids, setSel, actions);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sel, ids, setSel, actions]);
}
