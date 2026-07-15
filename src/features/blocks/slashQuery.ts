/** An in-progress "/" command query at the caret, with the range it occupies. */
export interface SlashQuery {
  query: string; // text after '/' up to the caret (may be empty)
  start: number; // index of the '/'
  end: number; // caret position
}

/**
 * Detect a "/" command query at the caret: a '/' preceded by start-of-text or
 * whitespace, followed by non-whitespace up to the caret. This is what lets the
 * slash menu open MID-LINE (not just on a block that starts with '/'), while the
 * word-boundary rule keeps it from firing inside a URL like "http://" (the '/'
 * there follows ':' or another '/', not whitespace). Pure — mirrors mentionQuery.
 */
export function slashQuery(value: string, caret: number): SlashQuery | null {
  const before = value.slice(0, caret);
  const at = before.lastIndexOf('/');
  if (at === -1) return null;
  if (at > 0 && !/\s/.test(before[at - 1])) return null; // '/' must start a word
  const query = before.slice(at + 1);
  if (/\s/.test(query)) return null; // a space ends the query
  return { query, start: at, end: caret };
}
