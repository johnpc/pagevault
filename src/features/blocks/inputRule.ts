/**
 * Markdown "input rules" for the WYSIWYG surface: when the text ending at the
 * caret just completed an inline marker (e.g. you finished typing `**bold**`),
 * the marker is already valid markdown so the surface re-renders it styled on
 * the next content sync — no transform needed there. What input rules add is the
 * NOTION FEEL for the *space-terminated* case: typing `**bold** ` should not keep
 * the raw stars; but since content is stored AS markdown, the stars ARE the
 * storage. So the only real transform is normalizing a just-typed marker so the
 * parser recognizes it — which parseInline already does. Thus the useful, pure
 * piece here is DETECTING a completed marker ending at the caret, so the caller
 * can nudge a re-render / place the caret outside the styled run.
 *
 * Returns the [start,end) range of the completed marker ending exactly at
 * `caret`, and its inner text, or null. Pure — unit-testable. Longest/greedy
 * markers (**, ~~, __) are checked before single-char ones.
 */
export interface CompletedMarker {
  start: number;
  end: number;
  marker: string;
  inner: string;
}

const MARKERS = ['**', '~~', '__', '*', '_', '`'];

export function completedMarkerAt(content: string, caret: number): CompletedMarker | null {
  const upto = content.slice(0, caret);
  for (const marker of MARKERS) {
    if (!upto.endsWith(marker)) continue;
    // Find the opening marker before the inner text (non-empty, no nested marker).
    const innerEnd = caret - marker.length;
    const openIdx = upto.lastIndexOf(marker, innerEnd - 1);
    if (openIdx === -1) continue;
    const inner = content.slice(openIdx + marker.length, innerEnd);
    // Reject empty or whitespace-only inner, and a nested same marker — matches
    // Notion (you can't bold nothing, and `** **` isn't a completed bold).
    if (inner.trim() === '' || inner.includes(marker)) continue;
    return { start: openIdx, end: caret, marker, inner };
  }
  return null;
}
