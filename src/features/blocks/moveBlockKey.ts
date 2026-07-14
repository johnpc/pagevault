import type { KeyboardEvent } from 'react';

/** The direction of a Cmd/Ctrl+Shift+Arrow "move this block" chord, or null when
 * the keypress isn't that gesture. Pure. */
export function moveBlockDir(
  e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'metaKey' | 'ctrlKey'>,
): 'up' | 'down' | null {
  if (!(e.metaKey || e.ctrlKey) || !e.shiftKey) return null;
  if (e.key === 'ArrowUp') return 'up';
  if (e.key === 'ArrowDown') return 'down';
  return null;
}

/** The block-list index of the row containing a textarea (its data-block-index),
 * or -1 when it can't be resolved. Pure except the DOM read on `el`. */
export function blockIndexOfTarget(el: HTMLTextAreaElement): number {
  const row = el.closest('[data-block-index]');
  return row ? Number(row.getAttribute('data-block-index')) : -1;
}

/**
 * Handle a Cmd/Ctrl+Shift+↑/↓ "move this block" keypress from a block textarea:
 * swap the block with its neighbor in `ids` via `move(fromId, toId)`. Returns
 * true when the chord was the gesture (so the caller stops), false otherwise.
 */
export function handleMoveBlockKey(
  e: KeyboardEvent,
  el: HTMLTextAreaElement,
  ids: string[],
  move?: (fromId: string, toId: string) => void,
): boolean {
  const dir = moveBlockDir(e);
  if (!dir || !move) return false;
  const i = blockIndexOfTarget(el);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i >= 0 && j >= 0 && j < ids.length) {
    e.preventDefault();
    move(ids[i], ids[j]);
  }
  return true;
}
