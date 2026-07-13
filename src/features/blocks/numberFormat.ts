/** How a number column displays its values (the stored cell stays a plain
 * string; formatting is presentational only). 'plain' = as typed. */
export type NumberFormat = 'plain' | 'comma' | 'percent' | 'usd' | 'eur' | 'gbp';

/** The formats offered in the column picker, in menu order. */
export const NUMBER_FORMATS: NumberFormat[] = ['plain', 'comma', 'percent', 'usd', 'eur', 'gbp'];

/** Human label for a number format (for the picker). */
export function numberFormatLabel(fmt: NumberFormat): string {
  const labels: Record<NumberFormat, string> = {
    plain: 'Plain',
    comma: 'Comma (1,000)',
    percent: 'Percent',
    usd: 'US Dollar ($)',
    eur: 'Euro (€)',
    gbp: 'Pound (£)',
  };
  return labels[fmt];
}

const CURRENCY: Partial<Record<NumberFormat, string>> = { usd: '$', eur: '€', gbp: '£' };

/** Group the integer part of a already-split numeric string with thousands
 * commas, preserving sign + decimals. */
function withCommas(n: string): string {
  const neg = n.startsWith('-');
  const [intPart, dec] = (neg ? n.slice(1) : n).split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}${grouped}${dec !== undefined ? `.${dec}` : ''}`;
}

/**
 * Format a stored numeric cell string for display. Non-numeric or empty values
 * pass through unchanged (so a half-typed cell isn't mangled). Pure — no locale
 * dependence, deterministic. `fmt` absent/'plain' returns the value as-is.
 */
export function formatNumber(value: string, fmt: string | undefined): string {
  if (!fmt || fmt === 'plain') return value;
  const trimmed = value.trim();
  if (trimmed === '') return value;
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return value;
  if (fmt === 'percent') return `${withCommas(String(num * 100))}%`;
  const symbol = CURRENCY[fmt as NumberFormat];
  if (symbol) {
    const fixed = withCommas(Math.abs(num).toFixed(2));
    return `${num < 0 ? '-' : ''}${symbol}${fixed}`;
  }
  return withCommas(String(num)); // 'comma'
}
