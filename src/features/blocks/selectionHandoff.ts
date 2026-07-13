import type { KeyboardEvent } from 'react';

/**
 * Decide whether a Shift+Arrow keypress inside a block's textarea should hand
 * off to block-level selection instead of extending the text selection.
 *
 * The natural rule (matches Notion / native editors): Shift+↓ hands off only
 * when the caret is at the very END of the text (nothing below to select within
 * the field), and Shift+↑ only when the caret is at the very START. In those
 * cases we return the direction (+1 / -1); otherwise null (let the textarea do
 * its normal within-line shift-select).
 *
 * `value` is the textarea's text; `start`/`end` are its selection offsets. A
 * non-collapsed in-field selection never hands off (the user is selecting text).
 */
export function selectionHandoffDir(
  e: Pick<KeyboardEvent, 'key' | 'shiftKey'>,
  value: string,
  start: number,
  end: number,
): -1 | 1 | null {
  if (!e.shiftKey || start !== end) return null;
  if (e.key === 'ArrowDown' && end === value.length) return 1;
  if (e.key === 'ArrowUp' && start === 0) return -1;
  return null;
}

/**
 * Compute the block selection a textarea keydown should start, or null if it
 * shouldn't hand off. Reads the textarea's caret + its enclosing row index
 * (data-block-index) and clamps the new focus to the list. Pure except for the
 * DOM reads on the passed element; kept here so the hook's handler stays flat.
 */
export function handoffSelection(
  e: Pick<KeyboardEvent, 'key' | 'shiftKey'>,
  el: HTMLTextAreaElement,
  count: number,
): { anchor: number; focus: number } | null {
  const dir = selectionHandoffDir(e, el.value, el.selectionStart, el.selectionEnd);
  if (dir === null) return null;
  const row = el.closest('[data-block-index]');
  const index = row ? Number(row.getAttribute('data-block-index')) : -1;
  if (index < 0) return null;
  return { anchor: index, focus: Math.max(0, Math.min(count - 1, index + dir)) };
}
