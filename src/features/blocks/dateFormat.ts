/** How a date column displays its ISO (YYYY-MM-DD) cell values. The stored cell
 * stays ISO; formatting is presentational only. 'iso' = as stored. */
export type DateFormat = 'iso' | 'medium' | 'long' | 'relative';

/** The date formats offered in the column picker, in menu order. */
export const DATE_FORMATS: DateFormat[] = ['iso', 'medium', 'long', 'relative'];

/** Human label for a date format (for the picker). */
export function dateFormatLabel(fmt: DateFormat): string {
  const labels: Record<DateFormat, string> = {
    iso: 'ISO (2026-01-05)',
    medium: 'Medium (Jan 5, 2026)',
    long: 'Long (January 5, 2026)',
    relative: 'Relative (in 3 days)',
  };
  return labels[fmt];
}

const MONTHS =
  'January February March April May June July August September October November December'.split(
    ' ',
  );

/** Parse an ISO YYYY-MM-DD into [year, month0, day], or null if malformed. */
function parseIso(iso: string): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  if (mo < 0 || mo > 11 || d < 1 || d > 31) return null;
  return [y, mo, d];
}

/** Whole days from `today` (ISO) to `iso` (ISO), using UTC midnight so DST never
 * shifts the count. Pure. */
function dayDelta(iso: string, today: string): number {
  const a = parseIso(iso)!;
  const b = parseIso(today)!;
  const ms = Date.UTC(a[0], a[1], a[2]) - Date.UTC(b[0], b[1], b[2]);
  return Math.round(ms / 86400000);
}

/** A human relative phrase for a whole-day delta (…/-2/-1/0/1/2/…). Pure. */
function relativePhrase(delta: number): string {
  if (delta === 0) return 'Today';
  if (delta === 1) return 'Tomorrow';
  if (delta === -1) return 'Yesterday';
  return delta > 0 ? `in ${delta} days` : `${-delta} days ago`;
}

/**
 * Format an ISO date cell for display. Empty or malformed values pass through
 * unchanged. `today` (ISO) is injected for the deterministic relative format —
 * callers pass the current day; tests pass a fixed one. Pure.
 */
export function formatDate(iso: string, fmt: string | undefined, today: string): string {
  if (!fmt || fmt === 'iso') return iso;
  const parts = parseIso(iso.trim());
  if (!parts) return iso;
  const [y, mo, d] = parts;
  if (fmt === 'medium') return `${MONTHS[mo].slice(0, 3)} ${d}, ${y}`;
  if (fmt === 'long') return `${MONTHS[mo]} ${d}, ${y}`;
  if (fmt === 'relative') return relativePhrase(dayDelta(iso.trim(), today));
  return iso;
}
