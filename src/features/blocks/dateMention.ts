/** A dynamic date insert offered by the @-menu (e.g. "@today"). `insert` is the
 * literal text dropped into the block when picked. */
export interface DateMention {
  key: string; // the @-keyword, e.g. 'today'
  label: string; // menu label, e.g. 'Today'
  insert: string; // resolved text, e.g. 'Jul 14, 2026' or 'Jul 14, 2026 3:04 PM'
}

const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

/** "Mon D, YYYY" for a date (local fields). Pure given the Date. */
function formatDay(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "Mon D, YYYY h:mm AM/PM" for a datetime (local fields). Pure given the Date. */
function formatDateTime(d: Date): string {
  const h = d.getHours();
  const min = d.getMinutes();
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${formatDay(d)} ${hour12}:${min < 10 ? `0${min}` : min} ${ampm}`;
}

/** A copy of `now` shifted by whole days. Pure. */
function addDays(now: Date, days: number): Date {
  const d = new Date(now.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

/** All date mentions resolved against `now`, in menu order. `now` is injected so
 * this is deterministic + unit-testable. Pure. */
export function allDateMentions(now: Date): DateMention[] {
  return [
    { key: 'today', label: 'Today', insert: formatDay(now) },
    { key: 'tomorrow', label: 'Tomorrow', insert: formatDay(addDays(now, 1)) },
    { key: 'yesterday', label: 'Yesterday', insert: formatDay(addDays(now, -1)) },
    { key: 'now', label: 'Now (date + time)', insert: formatDateTime(now) },
  ];
}

/** Date mentions whose key starts with the (lowercased) query — so "@to" offers
 * today + tomorrow. An empty query offers all. Pure. */
export function dateMentionMatches(query: string, now: Date): DateMention[] {
  const q = query.trim().toLowerCase();
  return allDateMentions(now).filter((m) => q === '' || m.key.startsWith(q));
}
