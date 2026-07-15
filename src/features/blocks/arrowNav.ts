import type { KeyboardEvent } from 'react';

/**
 * Decide whether a plain (unmodified) arrow keypress at a block's edge should
 * move the caret to the adjacent block — Notion/native-editor behavior:
 *   ArrowUp / ArrowLeft at the very START → previous block (-1)
 *   ArrowDown / ArrowRight at the very END → next block (+1)
 * Only for a collapsed caret with no Shift/Meta/Ctrl/Alt (those drive selection,
 * word-jump, etc.). Otherwise null — let the textarea handle it within-field.
 * Pure: takes the value + caret offsets. `start`/`end` are the selection range.
 */
export function edgeArrowDir(
  e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'metaKey' | 'ctrlKey' | 'altKey'>,
  value: string,
  start: number,
  end: number,
): -1 | 1 | null {
  if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || start !== end) return null;
  if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && start === 0) return -1;
  if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && end === value.length) return 1;
  return null;
}

/**
 * Move focus to the block textarea adjacent to `el` in the given direction,
 * placing the caret at the end (moving up) or start (moving down) so navigation
 * feels continuous. Reads the enclosing row's data-block-index and walks to the
 * sibling row. Returns true when it moved focus. DOM-only; kept out of the hook
 * so its keydown handler stays flat.
 */
export function focusAdjacentBlock(el: HTMLTextAreaElement, dir: -1 | 1): boolean {
  const row = el.closest('[data-block-index]');
  if (!row) return false;
  const index = Number(row.getAttribute('data-block-index'));
  const container = row.parentElement;
  const target = container?.querySelector(`[data-block-index="${index + dir}"]`);
  const input = target?.querySelector<HTMLTextAreaElement>('textarea.pv-block-input');
  if (!input) return dir === -1 && index === 0 ? focusPageTitle() : false;
  input.focus();
  const caret = dir === -1 ? input.value.length : 0;
  input.setSelectionRange(caret, caret);
  return true;
}

/** Move focus up into the page title (↑ at the start of the first block) — the
 * reverse of Enter/↓ in the title. Caret at the end of the title. DOM-only, so
 * no callback threading through the block tree. Returns true when the title was
 * found + focused. */
export function focusPageTitle(): boolean {
  const title = document.querySelector<HTMLInputElement>('input.pv-page-title');
  if (!title) return false;
  title.focus();
  const end = title.value.length;
  title.setSelectionRange(end, end);
  return true;
}
