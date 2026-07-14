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
 * Where a keypress in a table cell should move focus — spreadsheet navigation:
 *   Enter / ArrowDown → the cell one row down
 *   Shift+Enter / ArrowUp → the cell one row up
 *   ArrowLeft / ArrowRight → only at the text edge (so they still move the caret
 *     within a text input); handled by the caller via `atEdge`.
 * Returns the target cell, or null to let the input handle the key normally.
 * `rows`/`cols` are the grid bounds (clamped, never wraps). Pure.
 *
 * `atStart`/`atEnd` describe the caret within a text input (both true for
 * non-text controls like checkbox/select, where left/right should move cells).
 */
export function gridNavTarget(
  e: Pick<KeyboardEvent, 'key' | 'shiftKey'>,
  pos: CellPos,
  bounds: { rows: number; cols: number },
  edge: { atStart: boolean; atEnd: boolean },
): CellPos | null {
  const { r, c } = pos;
  const down = (e.key === 'Enter' && !e.shiftKey) || e.key === 'ArrowDown';
  const up = (e.key === 'Enter' && e.shiftKey) || e.key === 'ArrowUp';
  if (down && r < bounds.rows - 1) return { r: r + 1, c };
  if (up && r > 0) return { r: r - 1, c };
  if (e.key === 'ArrowRight' && edge.atEnd && c < bounds.cols - 1) return { r, c: c + 1 };
  if (e.key === 'ArrowLeft' && edge.atStart && c > 0) return { r, c: c - 1 };
  return null;
}
