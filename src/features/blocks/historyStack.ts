/**
 * A pure undo/redo stack of reversible edits. Each entry carries the data needed
 * to `undo` (restore the prior state) and `redo` (re-apply). The stack is generic
 * over the entry payload so the page-history hook decides what an edit is (a
 * block content change, a delete, etc.). No I/O — the hook runs the payloads.
 */
export interface HistoryEntry<T> {
  /** A coalescing key: consecutive pushes with the same key merge into one entry
   * (e.g. per-keystroke edits of the same block become a single undo step). '' or
   * undefined never coalesces. */
  coalesceKey?: string;
  payload: T;
}

export interface HistoryState<T> {
  past: HistoryEntry<T>[];
  future: HistoryEntry<T>[];
}

export function emptyHistory<T>(): HistoryState<T> {
  return { past: [], future: [] };
}

/**
 * Push a new edit. Clears the redo (`future`) stack — a fresh edit forks history.
 * If `entry` shares a non-empty coalesceKey with the top of `past`, it REPLACES
 * that entry's payload (the older payload already captured the pre-edit state, so
 * keeping it preserves a correct single-step undo across a run of keystrokes).
 * `cap` bounds the stack (drops oldest). Pure.
 */
export function pushEdit<T>(
  state: HistoryState<T>,
  entry: HistoryEntry<T>,
  cap = 100,
): HistoryState<T> {
  const top = state.past[state.past.length - 1];
  if (entry.coalesceKey && top && top.coalesceKey === entry.coalesceKey) {
    const past = state.past.slice(0, -1).concat({ ...top, payload: entry.payload });
    return { past, future: [] };
  }
  const past = state.past.concat(entry).slice(-cap);
  return { past, future: [] };
}

/** Move the top of `past` onto `future`, returning it + the new state, or null
 * when there's nothing to undo. Pure. */
export function popUndo<T>(
  state: HistoryState<T>,
): { entry: HistoryEntry<T>; state: HistoryState<T> } | null {
  if (state.past.length === 0) return null;
  const entry = state.past[state.past.length - 1];
  return {
    entry,
    state: { past: state.past.slice(0, -1), future: [entry, ...state.future] },
  };
}

/** Move the top of `future` back onto `past`, returning it + the new state, or
 * null when there's nothing to redo. Pure. */
export function popRedo<T>(
  state: HistoryState<T>,
): { entry: HistoryEntry<T>; state: HistoryState<T> } | null {
  if (state.future.length === 0) return null;
  const [entry, ...rest] = state.future;
  return { entry, state: { past: state.past.concat(entry), future: rest } };
}
