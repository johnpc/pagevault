/** What an active-selection keypress should do. Pure classification, so the
 * hook stays a thin dispatcher (keeps its cyclomatic complexity low). */
export type SelectionKeyAction =
  | { kind: 'selectAll' }
  | { kind: 'duplicate' }
  | { kind: 'indent'; dir: 'in' | 'out' }
  | { kind: 'move'; delta: 1 | -1; grow: boolean }
  | { kind: 'delete' }
  | { kind: 'clear' }
  | null;

/** Classify a keydown while a block selection is active. Returns null when the
 * key isn't one the selection handles (so the listener leaves it alone). */
export function selectionKeyAction(e: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}): SelectionKeyAction {
  const mod = e.metaKey || e.ctrlKey;
  const key = e.key.toLowerCase();
  if (mod && key === 'a') return { kind: 'selectAll' };
  if (mod && key === 'd') return { kind: 'duplicate' };
  if (e.key === 'Tab') return { kind: 'indent', dir: e.shiftKey ? 'out' : 'in' };
  if (e.key === 'ArrowDown') return { kind: 'move', delta: 1, grow: e.shiftKey };
  if (e.key === 'ArrowUp') return { kind: 'move', delta: -1, grow: e.shiftKey };
  if (e.key === 'Backspace' || e.key === 'Delete') return { kind: 'delete' };
  if (e.key === 'Escape') return { kind: 'clear' };
  return null;
}
