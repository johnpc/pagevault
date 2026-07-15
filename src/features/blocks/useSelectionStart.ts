import { useCallback, useRef, type Dispatch, type SetStateAction } from 'react';
import { selectionFromShiftClick, type BlockSelection } from './blockSelection';

/** Blur the focused field so the document listener owns nav/delete keys once a
 * block selection is active. */
const blurActive = () => (document.activeElement as HTMLElement | null)?.blur();

/**
 * The gestures that START a block selection: Shift+Click extends from the last
 * focused block, ⌘A selects all, clicking a ⋮⋮ handle selects one. Each blurs
 * the editing field so the selection's keyboard handlers take over. Split from
 * useBlockSelection to keep that hook under the line gate.
 */
export function useSelectionStart(
  ids: string[],
  setSel: Dispatch<SetStateAction<BlockSelection | null>>,
) {
  // The block index most recently focused — the anchor Shift+Click extends from.
  const focusedIndex = useRef<number | null>(null);
  const noteFocus = useCallback((index: number) => {
    focusedIndex.current = index;
  }, []);

  const shiftClick = useCallback(
    (index: number) => {
      setSel((s) => selectionFromShiftClick(s, index, focusedIndex.current));
      blurActive();
    },
    [setSel],
  );

  const selectRange = useCallback(
    (anchor: number, focus: number) => {
      setSel({ anchor, focus });
      blurActive();
    },
    [setSel],
  );
  const selectAll = useCallback(() => {
    if (ids.length) selectRange(0, ids.length - 1);
  }, [ids.length, selectRange]);
  const selectId = useCallback(
    (id: string) => {
      const i = ids.indexOf(id);
      if (i !== -1) selectRange(i, i);
    },
    [ids, selectRange],
  );

  return { noteFocus, shiftClick, selectAll, selectId };
}
