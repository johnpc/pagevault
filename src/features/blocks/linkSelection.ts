import { normalizeUrl } from './bookmarkUrl';

export interface LinkResult {
  value: string;
  /** Caret position to restore after the inserted link (end of it). */
  caret: number;
}

/**
 * Wrap the [start, end) selection of `value` as a markdown link `[selected](url)`
 * — the shared core of link-on-paste and the selection toolbar's link action.
 * The url is normalized (bare host → https://). With no selection the url text
 * itself becomes the link label. Returns the new value + caret after the link.
 * Pure.
 */
export function linkSelection(value: string, start: number, end: number, url: string): LinkResult {
  const href = normalizeUrl(url);
  const label = value.slice(start, end) || href;
  const link = `[${label}](${href})`;
  return { value: value.slice(0, start) + link + value.slice(end), caret: start + link.length };
}
