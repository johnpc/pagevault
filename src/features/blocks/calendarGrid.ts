import type { TableData } from '../../lib/pbTypes';

/** A day cell in the month grid: its ISO date (YYYY-MM-DD), whether it belongs
 * to the anchor month (vs. a leading/trailing spill day), and the real indices
 * of the rows whose date column falls on it. */
export interface CalendarDay {
  iso: string;
  day: number; // day-of-month (1–31)
  inMonth: boolean; // false for spill days from the prev/next month
  rows: number[]; // real indices into data.rows dated to this day
}

/** Zero-pad a number to 2 digits. */
const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

/** The ISO YYYY-MM-DD for a UTC year/month(0-based)/day. Pure — uses Date.UTC
 * only for calendar arithmetic (no wall-clock read), so it stays deterministic. */
export function isoDate(year: number, month: number, day: number): string {
  const d = new Date(Date.UTC(year, month, day));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Parse an anchor "YYYY-MM" (or a full ISO date) into {year, month} (month
 * 0-based). Returns null when it isn't a valid year-month. Pure. */
export function parseAnchor(anchor: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})/.exec(anchor);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11) return null;
  return { year, month };
}

/** Shift an anchor "YYYY-MM" by `delta` months (may cross years). Pure. */
export function shiftAnchor(anchor: string, delta: number): string {
  const a = parseAnchor(anchor) ?? { year: 2000, month: 0 };
  const total = a.year * 12 + a.month + delta;
  return `${Math.floor(total / 12)}-${pad((((total % 12) + 12) % 12) + 1)}`;
}

/** The month grid for `anchor` ("YYYY-MM"): 6 weeks × 7 days (Sun–Sat) covering
 * the whole month plus leading/trailing spill days, each carrying the real
 * indices of rows whose `dateCol` cell falls on that day. Pure. */
export function monthGrid(data: TableData, dateCol: number, anchor: string): CalendarDay[][] {
  const a = parseAnchor(anchor) ?? { year: 2000, month: 0 };
  const byDay = new Map<string, number[]>();
  data.rows.forEach((row, i) => {
    const iso = (row[dateCol] ?? '').slice(0, 10);
    if (iso) (byDay.get(iso) ?? byDay.set(iso, []).get(iso)!).push(i);
  });
  const first = new Date(Date.UTC(a.year, a.month, 1));
  const start = 1 - first.getUTCDay(); // day-of-month of the grid's top-left (may be ≤ 0)
  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(Date.UTC(a.year, a.month, start + w * 7 + d));
      const iso = isoDate(cellDate.getUTCFullYear(), cellDate.getUTCMonth(), cellDate.getUTCDate());
      week.push({
        iso,
        day: cellDate.getUTCDate(),
        inMonth: cellDate.getUTCMonth() === a.month,
        rows: byDay.get(iso) ?? [],
      });
    }
    weeks.push(week);
  }
  return weeks;
}

/** The index of the first `date` column, or -1 if the table has none. Pure. */
export function firstDateColumn(data: TableData): number {
  return data.columns.findIndex((c) => c.type === 'date');
}
