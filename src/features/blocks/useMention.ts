import { useMemo, useState, type KeyboardEvent, type RefObject, type SyntheticEvent } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { usePages } from '../pages/pagesApi';
import {
  mentionQuery,
  applyMention,
  applyText,
  mentionMatches,
  type MentionQuery,
} from './mention';
import { dateMentionMatches, type DateMention } from './dateMention';

/** One item in the @-menu: a page to link, or a dynamic date insert. */
export type MentionItem = { kind: 'page'; page: PageRecord } | { kind: 'date'; date: DateMention };

/**
 * The @-mention picker for a block textarea. Watches for an active "@query" at
 * the caret and surfaces matching pages; Arrow/Enter/Escape drive selection and
 * a pick inserts the mention token. Owns caret tracking + the apply side-effect
 * so TextBlockBody stays render-only and neither file grows past the limits.
 */
export function useMention(
  pageId: string,
  value: string,
  setValue: (v: string) => void,
  ref: RefObject<HTMLTextAreaElement | null>,
) {
  const { data: pages } = usePages();
  const [active, setActive] = useState(0);
  const [caret, setCaret] = useState(0);
  // The start index of a query the user dismissed with Escape; the menu stays
  // hidden for that same "@" (keeping the typed text) and reopens once the query
  // moves to a different mention. null = nothing dismissed.
  const [dismissed, setDismissed] = useState<number | null>(null);

  const query = useMemo<MentionQuery | null>(() => mentionQuery(value, caret), [value, caret]);
  // Date inserts (@today/@now/…) lead, then matching page links. Date resolution
  // uses the wall clock at menu-open time — the picker is a live UI, not a tested
  // pure helper (that logic lives in dateMention.ts with an injected `now`).
  const matches = useMemo<MentionItem[]>(() => {
    if (!query) return [];
    const dates = dateMentionMatches(query.query, new Date()).map((date): MentionItem => ({
      kind: 'date',
      date,
    }));
    const pageItems = mentionMatches(pages ?? [], query.query, pageId).map((page): MentionItem => ({
      kind: 'page',
      page,
    }));
    return [...dates, ...pageItems];
  }, [query, pages, pageId]);
  const open = matches.length > 0 && query?.start !== dismissed;

  const onSelect = (e: SyntheticEvent<HTMLTextAreaElement>) =>
    setCaret(e.currentTarget.selectionStart);

  const pick = (item: MentionItem) => {
    const next =
      item.kind === 'page'
        ? applyMention(value, query!, item.page)
        : applyText(value, query!, item.date.insert);
    setValue(next.value);
    setActive(0);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.setSelectionRange(next.caret, next.caret);
        setCaret(next.caret);
      }
    });
  };

  // Consume Arrow/Enter/Escape while open; returns true when handled so the
  // caller skips its own key handling.
  const onKeyDown = (e: KeyboardEvent): boolean => {
    if (!open) return false;
    const nav: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => (a + 1) % matches.length),
      ArrowUp: () => setActive((a) => (a - 1 + matches.length) % matches.length),
      Escape: () => (setActive(0), setDismissed(query?.start ?? null)),
      Enter: () => pick(matches[active]),
    };
    if (!nav[e.key]) return false;
    e.preventDefault();
    nav[e.key]();
    return true;
  };

  return { open, matches, active, pick, onSelect, onKeyDown };
}
