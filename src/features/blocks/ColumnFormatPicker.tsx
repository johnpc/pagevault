import type { TableData } from '../../lib/pbTypes';
import { setColumnFormat } from './tableColumnFields';
import { NUMBER_FORMATS, numberFormatLabel } from './numberFormat';

/** The number-format dropdown for a number column's header (plain / comma /
 * percent / currencies). Render-only; the change patches the column. */
export function ColumnFormatPicker({
  data,
  c,
  format,
  save,
}: {
  data: TableData;
  c: number; // real column index
  format: string | undefined;
  save: (next: TableData) => void;
}) {
  return (
    <select
      aria-label={`Column ${c + 1} format`}
      value={format ?? 'plain'}
      onChange={(e) => save(setColumnFormat(data, c, e.target.value))}
    >
      {NUMBER_FORMATS.map((f) => (
        <option key={f} value={f}>
          {numberFormatLabel(f)}
        </option>
      ))}
    </select>
  );
}
