/** Numeric column summaries (sum/avg/min/max/median/range), split out so the
 * main summarize() switch stays simple. Pure — deterministic rounding, no
 * locale surprises. */

const round = (n: number) => Math.round(n * 100) / 100;

/** The numeric-summary kinds this module handles. */
export type NumericKind = 'sum' | 'avg' | 'min' | 'max' | 'median' | 'range';

/** Median of a non-empty, already-sorted-ascending list. */
function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Compute a numeric summary over the non-empty cell strings. Returns '' when
 * there are no parseable numbers. Pure. */
export function numericSummary(kind: NumericKind, nonEmpty: string[]): string {
  const nums = nonEmpty.map(parseFloat).filter((n) => !isNaN(n));
  if (nums.length === 0) return '';
  const sorted = [...nums].sort((a, b) => a - b);
  const total = nums.reduce((a, b) => a + b, 0);
  const value = {
    sum: total,
    avg: total / nums.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: median(sorted),
    range: sorted[sorted.length - 1] - sorted[0],
  }[kind];
  return String(round(value));
}
