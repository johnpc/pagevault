import type { TableColumn } from '../../lib/pbTypes';

/** The per-column footer calculation a table can show. 'none' = no summary. */
export type SummaryKind =
  | 'none'
  | 'count' // non-empty cells
  | 'empty' // empty cells
  | 'unique' // distinct non-empty values
  | 'sum' // number columns
  | 'avg' // number columns
  | 'checked' // checkbox: number checked
  | 'percent'; // checkbox: % checked

/** The summary kinds offered for a column, by its type. Number columns get
 * sum/avg; checkbox columns get checked/percent; all get the count family. */
export function summaryOptions(type: TableColumn['type']): SummaryKind[] {
  const base: SummaryKind[] = ['none', 'count', 'empty', 'unique'];
  if (type === 'number') return [...base, 'sum', 'avg'];
  if (type === 'checkbox') return [...base, 'checked', 'percent'];
  return base;
}

/** Human label for a summary kind (for the picker + the footer readout). */
export function summaryLabel(kind: SummaryKind): string {
  const labels: Record<SummaryKind, string> = {
    none: 'Calculate',
    count: 'Count',
    empty: 'Empty',
    unique: 'Unique',
    sum: 'Sum',
    avg: 'Average',
    checked: 'Checked',
    percent: 'Percent checked',
  };
  return labels[kind];
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Compute a column's summary over the given cell values (already filtered to
 * the visible rows). Returns '' for 'none' or when a numeric summary has no
 * numbers. Pure — deterministic, no formatting locale surprises. */
export function summarize(kind: SummaryKind, cells: string[]): string {
  const nonEmpty = cells.filter((c) => c !== '');
  if (kind === 'count') return String(nonEmpty.length);
  if (kind === 'empty') return String(cells.length - nonEmpty.length);
  if (kind === 'unique') return String(new Set(nonEmpty).size);
  if (kind === 'checked') return String(cells.filter((c) => c === 'true').length);
  if (kind === 'percent') {
    if (cells.length === 0) return '0%';
    return `${round((cells.filter((c) => c === 'true').length / cells.length) * 100)}%`;
  }
  if (kind === 'sum' || kind === 'avg') {
    const nums = nonEmpty.map(parseFloat).filter((n) => !isNaN(n));
    if (nums.length === 0) return '';
    const total = nums.reduce((a, b) => a + b, 0);
    return String(round(kind === 'sum' ? total : total / nums.length));
  }
  return '';
}
