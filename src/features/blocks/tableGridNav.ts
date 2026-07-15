import type { KeyboardEvent } from 'react';

export interface CellPos {
  r: number;
  c: number;
}

/** Read a `data-cell="r-c"` position from the focused cell's enclosing td, or
 * null when the element isn't inside a data-cell. */
export function cellPosOf(el: HTMLElement): CellPos | null {
  const attr = el.closest('td[data-cell]')?.getAttribute('data-cell');
  if (!attr) return null;
  const [r, c] = attr.split('-').map(Number);
  return Number.isFinite(r) && Number.isFinite(c) ? { r, c } : null;
}

/** Whether the caret sits at the start/end of a text field. Both true for
 * non-text controls (checkbox/select) so left/right navigate cells. */
export function caretEdges(el: HTMLElement): { atStart: boolean; atEnd: boolean } {
  if (el instanceof HTMLInputElement && el.type === 'text') {
    const s = el.selectionStart ?? 0;
    const e = el.selectionEnd ?? 0;
    return { atStart: s === 0 && e === 0, atEnd: s === el.value.length && e === el.value.length };
  }
  if (el instanceof HTMLTextAreaElement) {
    const s = el.selectionStart ?? 0;
    return { atStart: s === 0, atEnd: s === el.value.length };
  }
  return { atStart: true, atEnd: true };
}

/**
 * Where a keypress in a table cell should move focus — spreadsheet navigation.
 * Delegates to the per-direction helpers below (Tab across cells, Enter/arrows
 * between rows, ←/→ across columns at the text edge). Returns the target cell,
 * or null to let the input handle the key normally. `bounds` clamps (no wrap
 * except Tab); `edge` is the caret position within a text input. Pure.
 */
export function gridNavTarget(
  e: Pick<KeyboardEvent, 'key' | 'shiftKey'>,
  pos: CellPos,
  bounds: { rows: number; cols: number },
  edge: { atStart: boolean; atEnd: boolean },
): CellPos | null {
  if (e.key === 'Tab') return tabTarget(pos, bounds, e.shiftKey);
  return rowTarget(e, pos, bounds) ?? colTarget(e, pos, bounds, edge);
}

/** Enter/Shift+Enter/↑/↓ → one row down or up (clamped, no wrap). Pure. */
function rowTarget(
  e: Pick<KeyboardEvent, 'key' | 'shiftKey'>,
  { r, c }: CellPos,
  bounds: { rows: number; cols: number },
): CellPos | null {
  const down = (e.key === 'Enter' && !e.shiftKey) || e.key === 'ArrowDown';
  const up = (e.key === 'Enter' && e.shiftKey) || e.key === 'ArrowUp';
  if (down && r < bounds.rows - 1) return { r: r + 1, c };
  if (up && r > 0) return { r: r - 1, c };
  return null;
}

/** ←/→ → one column, but only at the text edge (so mid-text they move the
 * caret, not the cell). Clamped, no wrap. Pure. */
function colTarget(
  e: Pick<KeyboardEvent, 'key'>,
  { r, c }: CellPos,
  bounds: { rows: number; cols: number },
  edge: { atStart: boolean; atEnd: boolean },
): CellPos | null {
  if (e.key === 'ArrowRight' && edge.atEnd && c < bounds.cols - 1) return { r, c: c + 1 };
  if (e.key === 'ArrowLeft' && edge.atStart && c > 0) return { r, c: c - 1 };
  return null;
}

/** The next (Shift → previous) cell for Tab, wrapping across rows. Null at the
 * grid's very last (or first) cell so Tab escapes the table there. Pure. */
function tabTarget(
  pos: CellPos,
  bounds: { rows: number; cols: number },
  back: boolean,
): CellPos | null {
  const { r, c } = pos;
  if (back) {
    if (c > 0) return { r, c: c - 1 };
    if (r > 0) return { r: r - 1, c: bounds.cols - 1 };
    return null; // first cell — let Tab escape backwards
  }
  if (c < bounds.cols - 1) return { r, c: c + 1 };
  if (r < bounds.rows - 1) return { r: r + 1, c: 0 };
  return null; // last cell — let Tab escape forwards
}
