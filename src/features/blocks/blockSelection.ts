/**
 * Pure math for a keyboard block selection: an inclusive range over the visible
 * block list, defined by an `anchor` index (where selection started) and a
 * `focus` index (the moving end). Shift+Arrow moves `focus`; the selected set is
 * every id between the two, inclusive. Kept pure so it's unit-tested without the
 * DOM.
 */

export interface BlockSelection {
  anchor: number;
  focus: number;
}

/** The [low, high] inclusive bounds of a selection. */
export function selectionBounds(sel: BlockSelection): [number, number] {
  return sel.anchor <= sel.focus ? [sel.anchor, sel.focus] : [sel.focus, sel.anchor];
}

/** The ids of the selected blocks, in list order. */
export function selectedIds(sel: BlockSelection, ids: string[]): string[] {
  const [lo, hi] = selectionBounds(sel);
  return ids.slice(Math.max(0, lo), Math.min(ids.length - 1, hi) + 1);
}

/** Whether a block index falls inside the selection. */
export function isSelected(sel: BlockSelection, index: number): boolean {
  const [lo, hi] = selectionBounds(sel);
  return index >= lo && index <= hi;
}

/**
 * Move the selection's focus by `dir` (+1 down, -1 up). When `extend` (Shift),
 * only the focus end moves, growing/shrinking the range; otherwise the whole
 * selection collapses to a single caret block at the new index. Clamped to the
 * list bounds. Returns the next selection.
 */
export function moveSelection(
  sel: BlockSelection,
  dir: -1 | 1,
  extend: boolean,
  count: number,
): BlockSelection {
  if (count === 0) return sel;
  const nextFocus = Math.max(0, Math.min(count - 1, sel.focus + dir));
  return extend
    ? { anchor: sel.anchor, focus: nextFocus }
    : { anchor: nextFocus, focus: nextFocus };
}

/** The index to place the caret after deleting the selection: the block just
 * above the selection (or 0 if it started at the top). */
export function indexAfterDelete(sel: BlockSelection): number {
  const [lo] = selectionBounds(sel);
  return Math.max(0, lo - 1);
}

/**
 * The selection after a Shift+Click on block `index`. With no current selection,
 * the anchor is the currently-focused block (`focusedIndex`, or `index` when
 * nothing is focused) and the focus moves to the clicked block — selecting the
 * range between. With an existing selection, keep the anchor and only move the
 * focus to the clicked block (extend). Pure.
 */
export function selectionFromShiftClick(
  sel: BlockSelection | null,
  index: number,
  focusedIndex: number | null,
): BlockSelection {
  if (sel) return { anchor: sel.anchor, focus: index };
  return { anchor: focusedIndex ?? index, focus: index };
}
