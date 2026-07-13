import type { TableData } from '../../lib/pbTypes';
import { setColumnFormat } from './tableColumnFields';
import { NUMBER_FORMATS, numberFormatLabel } from './numberFormat';
import { DATE_FORMATS, dateFormatLabel } from './dateFormat';

/** The format options + labels + default value for a formattable column kind. */
const SPECS = {
  number: { options: NUMBER_FORMATS as string[], label: numberFormatLabel, fallback: 'plain' },
  date: { options: DATE_FORMATS as string[], label: dateFormatLabel, fallback: 'iso' },
} as const;

/** The display-format dropdown for a number or date column's header. Number
 * columns get plain/comma/percent/currency; date columns get iso/medium/long/
 * relative. Render-only; the change patches the column. */
export function ColumnFormatPicker({
  data,
  c,
  format,
  kind,
  save,
}: {
  data: TableData;
  c: number; // real column index
  format: string | undefined;
  kind: 'number' | 'date';
  save: (next: TableData) => void;
}) {
  const spec = SPECS[kind];
  return (
    <select
      aria-label={`Column ${c + 1} format`}
      value={format ?? spec.fallback}
      onChange={(e) => save(setColumnFormat(data, c, e.target.value))}
    >
      {spec.options.map((f) => (
        <option key={f} value={f}>
          {(spec.label as (v: string) => string)(f)}
        </option>
      ))}
    </select>
  );
}
