/** The markdown marker for a keyboard formatting shortcut. */
export const FORMAT_MARKERS: Record<string, string> = {
  b: '**', // bold
  i: '*', // italic
  e: '`', // code (Notion uses Cmd+E)
};

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
 * Handle a Cmd/Ctrl+B/I/E formatting keystroke on a textarea: wrap the selection
 * in the matching marker, apply via `setValue`, and restore the selection.
 * Returns true when handled. Skips code blocks (literal contents). Kept out of
 * useBlockInput so that hook stays small.
 */
export function applyFormatKey(
  e: {
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    preventDefault: () => void;
    currentTarget: HTMLTextAreaElement;
  },
  value: string,
  isCode: boolean,
  setValue: (v: string) => void,
): boolean {
  const marker = (e.metaKey || e.ctrlKey) && FORMAT_MARKERS[e.key.toLowerCase()];
  if (!marker || isCode) return false;
  e.preventDefault();
  const el = e.currentTarget;
  const next = wrapSelection(value, el.selectionStart, el.selectionEnd, marker);
  setValue(next.value);
  requestAnimationFrame(() => el.setSelectionRange(next.start, next.end));
  return true;
}
