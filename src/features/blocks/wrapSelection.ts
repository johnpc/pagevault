/** The markdown marker for a plain (no-Shift) Cmd/Ctrl formatting shortcut. */
export const FORMAT_MARKERS: Record<string, string> = {
  b: '**', // bold
  i: '*', // italic
  e: '`', // code (Notion uses Cmd+E)
  u: '__', // underline (Notion uses Cmd+U)
};

/** Markers for Cmd/Ctrl+Shift shortcuts, keyed by lowercased letter. */
export const SHIFT_FORMAT_MARKERS: Record<string, string> = {
  s: '~~', // strikethrough (Notion uses Cmd+Shift+S)
};

/** The marker for a formatting keystroke, honoring the Shift modifier, or ''. */
export function markerFor(key: string, shift: boolean): string {
  const table = shift ? SHIFT_FORMAT_MARKERS : FORMAT_MARKERS;
  return table[key.toLowerCase()] || '';
}

export interface WrapResult {
  value: string;
  /** New selection range, so the caller can restore it around the wrapped text. */
  start: number;
  end: number;
}

/**
 * Wrap the [start, end) selection of `value` in `marker` (e.g. "**"). With no
 * selection (start === end) it inserts the pair and places the caret between
 * them. Returns the new value + the selection to restore. Pure.
 */
export function wrapSelection(
  value: string,
  start: number,
  end: number,
  marker: string,
): WrapResult {
  const selected = value.slice(start, end);
  const wrapped = `${marker}${selected}${marker}`;
  const next = value.slice(0, start) + wrapped + value.slice(end);
  return { value: next, start: start + marker.length, end: end + marker.length };
}

/**
 * Handle a Cmd/Ctrl formatting keystroke on a textarea: B/I/E/U (bold/italic/
 * code/underline) and Shift+S (strikethrough) wrap the selection in the matching
 * marker, apply via `setValue`, and restore the selection. Returns true when
 * handled. Skips code blocks (literal contents). Kept out of useBlockInput so
 * that hook stays small.
 */
export function applyFormatKey(
  e: {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    preventDefault: () => void;
    currentTarget: HTMLTextAreaElement;
  },
  value: string,
  isCode: boolean,
  setValue: (v: string) => void,
): boolean {
  const marker = (e.metaKey || e.ctrlKey) && markerFor(e.key, e.shiftKey);
  if (!marker || isCode) return false;
  e.preventDefault();
  const el = e.currentTarget;
  const next = wrapSelection(value, el.selectionStart, el.selectionEnd, marker);
  setValue(next.value);
  requestAnimationFrame(() => el.setSelectionRange(next.start, next.end));
  return true;
}
