import type { PageRecord } from '../../lib/pbClient';
import { displayTitle } from '../pages/pageTree';

/** An active @-mention query being typed, with the caret range it occupies. */
export interface MentionQuery {
  query: string; // text after '@' up to the caret (may be empty)
  start: number; // index of the '@'
  end: number; // caret position
}

/**
 * Detect an in-progress @-mention at the caret: an '@' preceded by start-of-text
 * or whitespace, followed by non-whitespace up to the caret. Returns null when
 * the caret isn't inside such a token. Pure.
 */
export function mentionQuery(value: string, caret: number): MentionQuery | null {
  const before = value.slice(0, caret);
  const at = before.lastIndexOf('@');
  if (at === -1) return null;
  if (at > 0 && !/\s/.test(before[at - 1])) return null; // '@' must start a word
  const query = before.slice(at + 1);
  if (/\s/.test(query)) return null; // a space ends the mention
  return { query, start: at, end: caret };
}

/** The mention token that links `page`, e.g. "@[Trip plan](abc123)". Pure. */
export function mentionToken(page: Pick<PageRecord, 'id' | 'title'>): string {
  return `@[${displayTitle(page)}](${page.id})`;
}

/**
 * Replace the active @-query in `value` with the mention token for `page`,
 * returning the new value and the caret position after the inserted token. Pure.
 */
export function applyMention(
  value: string,
  q: MentionQuery,
  page: Pick<PageRecord, 'id' | 'title'>,
): { value: string; caret: number } {
  const token = mentionToken(page);
  const next = value.slice(0, q.start) + token + value.slice(q.end);
  return { value: next, caret: q.start + token.length };
}

/** The pages matching a mention query (case-insensitive title prefix/substring),
 * excluding the current page, capped at `limit`. Pure. */
export function mentionMatches(
  pages: PageRecord[],
  query: string,
  currentId: string,
  limit = 6,
): PageRecord[] {
  const q = query.trim().toLowerCase();
  return pages
    .filter((p) => !p.archived && p.id !== currentId)
    .filter((p) => q === '' || displayTitle(p).toLowerCase().includes(q))
    .slice(0, limit);
}
