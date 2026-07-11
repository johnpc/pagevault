import { useMemo, useState, type KeyboardEvent, type RefObject, type SyntheticEvent } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { usePages } from '../pages/pagesApi';
import { mentionQuery, applyMention, mentionMatches, type MentionQuery } from './mention';

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

  const query = useMemo<MentionQuery | null>(() => mentionQuery(value, caret), [value, caret]);
  const matches = useMemo<PageRecord[]>(
    () => (query ? mentionMatches(pages ?? [], query.query, pageId) : []),
    [query, pages, pageId],
  );
  const open = matches.length > 0;

  const onSelect = (e: SyntheticEvent<HTMLTextAreaElement>) =>
    setCaret(e.currentTarget.selectionStart);

  const pick = (page: PageRecord) => {
    const next = applyMention(value, query!, page);
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
      Escape: () => setActive(0),
      Enter: () => pick(matches[active]),
    };
    if (!nav[e.key]) return false;
    e.preventDefault();
    nav[e.key]();
    return true;
  };

  return { open, matches, active, pick, onSelect, onKeyDown };
}
