/** What an active-selection keypress should do. Pure classification, so the
 * hook stays a thin dispatcher (keeps its cyclomatic complexity low). */
export type SelectionKeyAction =
  | { kind: 'selectAll' }
  | { kind: 'duplicate' }
  | { kind: 'copy' }
  | { kind: 'cut' }
  | { kind: 'indent'; dir: 'in' | 'out' }
  | { kind: 'move'; delta: 1 | -1; grow: boolean }
  | { kind: 'delete' }
  | { kind: 'clear' }
  | null;

// Cmd/Ctrl+<letter> chords, and the plain keys that don't need a modifier.
const MOD_KEYS: Record<string, SelectionKeyAction> = {
  a: { kind: 'selectAll' },
  c: { kind: 'copy' },
  x: { kind: 'cut' },
  d: { kind: 'duplicate' },
};
const PLAIN_KEYS: Record<string, SelectionKeyAction> = {
  Backspace: { kind: 'delete' },
  Delete: { kind: 'delete' },
  Escape: { kind: 'clear' },
};

/** Classify a keydown while a block selection is active. Returns null when the
 * key isn't one the selection handles (so the listener leaves it alone). Table-
 * driven so its cyclomatic complexity stays low. */
export function selectionKeyAction(e: {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}): SelectionKeyAction {
  if (e.metaKey || e.ctrlKey) return MOD_KEYS[e.key.toLowerCase()] ?? null;
  if (e.key === 'Tab') return { kind: 'indent', dir: e.shiftKey ? 'out' : 'in' };
  if (e.key === 'ArrowDown') return { kind: 'move', delta: 1, grow: e.shiftKey };
  if (e.key === 'ArrowUp') return { kind: 'move', delta: -1, grow: e.shiftKey };
  return PLAIN_KEYS[e.key] ?? null;
}
