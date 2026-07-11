import type { TableData, TableColumnType } from '../../lib/pbTypes';
import { setColumn, setColumnType, removeColumn, addColumn } from './tableData';

const TYPES: TableColumnType[] = ['text', 'number', 'checkbox', 'select'];

/** The table header row: per-column name input + a type picker + delete, plus
 * the add-column button. Render-only; edits bubble up via `save`. */
export function TableHead({ data, save }: { data: TableData; save: (next: TableData) => void }) {
  return (
    <thead>
      <tr>
        {data.columns.map((col, c) => (
          <th key={c}>
            <div className="pv-table-head">
              <input
                aria-label={`Column ${c + 1} name`}
                value={col.name}
                onChange={(e) => save(setColumn(data, c, e.target.value))}
              />
              <select
                aria-label={`Column ${c + 1} type`}
                value={col.type}
                onChange={(e) => save(setColumnType(data, c, e.target.value as TableColumnType))}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {data.columns.length > 1 && (
                <button
                  className="pv-table-del"
                  aria-label={`Delete column ${c + 1}`}
                  onClick={() => save(removeColumn(data, c))}
                >
                  ×
                </button>
              )}
            </div>
          </th>
        ))}
        <th className="pv-table-addcol">
          <button aria-label="Add column" onClick={() => save(addColumn(data))}>
            +
          </button>
        </th>
      </tr>
    </thead>
  );
}
