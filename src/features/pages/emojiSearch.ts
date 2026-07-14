import { EMOJIS, type Emoji } from './emojiData';

/** Emojis whose char or keywords match the (case-insensitive, trimmed) query.
 * A blank query returns the whole set. Matching is a simple substring over the
 * keyword string, so "cal" finds 📅 (calendar) and "goal" finds 🎯 and 🏆. Pure. */
export function emojiSearch(query: string): Emoji[] {
  const q = query.trim().toLowerCase();
  if (q === '') return EMOJIS;
  return EMOJIS.filter((e) => e.char === q || e.keywords.includes(q));
}
