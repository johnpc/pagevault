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
  // Read `ids` via a latest-ref so the callbacks below keep a STABLE identity
  // across renders — `ids` is a fresh array every keystroke (the blocks cache is
  // rewritten optimistically), and selectId is a prop on every memoized BlockRow,
  // so an unstable identity would re-render every row on each character typed.
  const idsRef = useRef(ids);
  idsRef.current = ids;
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
    if (idsRef.current.length) selectRange(0, idsRef.current.length - 1);
  }, [selectRange]);
  const selectId = useCallback(
    (id: string) => {
      const i = idsRef.current.indexOf(id);
      if (i !== -1) selectRange(i, i);
    },
    [selectRange],
  );

  return { noteFocus, shiftClick, selectAll, selectId };
}
