import type { TableColumn } from '../../lib/pbTypes';
import { numericSummary, type NumericKind } from './tableNumericSummary';

/** The per-column footer calculation a table can show. 'none' = no summary. */
export type SummaryKind =
  | 'none'
  | 'count' // non-empty cells
  | 'empty' // empty cells
  | 'unique' // distinct non-empty values
  | NumericKind // number columns: sum/avg/min/max/median/range
  | 'checked' // checkbox: number checked
  | 'percent'; // checkbox: % checked

/** The number-column summaries (in menu order). */
const NUMERIC: NumericKind[] = ['sum', 'avg', 'min', 'max', 'median', 'range'];

/** The summary kinds offered for a column, by its type. Number columns get the
 * numeric family; checkbox columns get checked/percent; all get the count
 * family. */
export function summaryOptions(type: TableColumn['type']): SummaryKind[] {
  const base: SummaryKind[] = ['none', 'count', 'empty', 'unique'];
  if (type === 'number') return [...base, ...NUMERIC];
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
    min: 'Min',
    max: 'Max',
    median: 'Median',
    range: 'Range',
    checked: 'Checked',
    percent: 'Percent checked',
  };
  return labels[kind];
}

const round = (n: number) => Math.round(n * 100) / 100;
const isNumeric = (kind: SummaryKind): kind is NumericKind =>
  (NUMERIC as SummaryKind[]).includes(kind);

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
  if (isNumeric(kind)) return numericSummary(kind, nonEmpty);
  return '';
}
