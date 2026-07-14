/** A single-line http(s) URL (the whole pasted string, trimmed, is one link). */
const URL_ONLY = /^https?:\/\/[^\s]+$/i;

export interface LinkPasteResult {
  value: string;
  /** Caret position to restore after the paste (end of the inserted link). */
  caret: number;
}

/**
 * Notion-style "paste a URL over a text selection": if `pasted` is a bare URL
 * and a non-empty selection [start, end) is active, wrap the selected text as a
 * markdown link `[selected](url)`. Returns the new value + caret, or null when
 * it doesn't apply (no selection, or the clipboard isn't a lone URL) so the
 * caller lets the browser paste normally. Pure.
 */
export function linkOnPaste(
  value: string,
  start: number,
  end: number,
  pasted: string,
): LinkPasteResult | null {
  if (start === end) return null; // no selection to turn into link text
  const url = pasted.trim();
  if (!URL_ONLY.test(url)) return null; // only a lone URL becomes a link
  const selected = value.slice(start, end);
  const link = `[${selected}](${url})`;
  return { value: value.slice(0, start) + link + value.slice(end), caret: start + link.length };
}
