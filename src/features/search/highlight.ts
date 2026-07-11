/** A text run, flagged when it is a case-insensitive match of the query. */
export interface HighlightPart {
  text: string;
  match: boolean;
}

/**
 * Split `text` into runs where the (case-insensitive) `query` matches, so the UI
 * can bold the hits. All occurrences are marked. An empty query yields one plain
 * run. Pure — trivially unit-testable.
 */
export function highlightParts(text: string, query: string): HighlightPart[] {
  const q = query.trim();
  if (q === '') return text ? [{ text, match: false }] : [];
  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const parts: HighlightPart[] = [];
  let i = 0;
  while (i < text.length) {
    const found = lowerText.indexOf(lowerQ, i);
    if (found === -1) {
      parts.push({ text: text.slice(i), match: false });
      break;
    }
    if (found > i) parts.push({ text: text.slice(i, found), match: false });
    parts.push({ text: text.slice(found, found + q.length), match: true });
    i = found + q.length;
  }
  return parts;
}

/** A rank score for a title against a query: 0 = exact, 1 = prefix, 2 = word-
 * boundary, 3 = substring. Lower sorts first. Pure. */
export function titleRank(title: string, query: string): number {
  const t = title.trim().toLowerCase();
  const q = query.trim().toLowerCase();
  if (q === '') return 3;
  if (t === q) return 0;
  if (t.startsWith(q)) return 1;
  if (t.split(/\s+/).some((w) => w.startsWith(q))) return 2;
  return 3;
}
