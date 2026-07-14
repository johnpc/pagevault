import type { TableData } from '../../lib/pbTypes';
import { normalize } from '../blocks/tableData';

/** A static, read-only HTML table for the public share view. Checkbox cells
 * show ✓ / blank; every other cell shows its raw value. No editing, sorting, or
 * views — just the data, so a shared page with a database isn't blank. */
export function SharedTable({ data }: { data: TableData | null }) {
  const { columns, rows } = normalize(data);
  const cell = (value: string, c: number) =>
    columns[c]?.type === 'checkbox' ? (value === 'true' ? '✓' : '') : value;
  return (
    <table className="pv-shared-table">
      <thead>
        <tr>
          {columns.map((col, c) => (
            <th key={c}>{col.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {columns.map((_, c) => (
              <td key={c}>{cell(row[c] ?? '', c)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
