import type { TableData, TableColumnType } from '../../lib/pbTypes';
import { setColumn, setColumnType, removeColumn, addColumn } from './tableData';

const TYPES: TableColumnType[] = ['text', 'number', 'checkbox', 'select', 'date'];

interface SortState {
  col: number;
  dir: 'asc' | 'desc';
}

interface HeadProps {
  data: TableData;
  save: (next: TableData) => void;
  onSort: (col: number) => void;
  sort: SortState | null;
}

/** The table header row: a drag-column spacer, then per-column sort button +
 * name input + type picker + delete, plus the add-column button. Render-only. */
export function TableHead({ data, save, onSort, sort }: HeadProps) {
  const arrow = (c: number) => (sort?.col !== c ? '↕' : sort.dir === 'asc' ? '▲' : '▼');
  return (
    <thead>
      <tr>
        <th className="pv-table-drag" aria-hidden="true" />
        {data.columns.map((col, c) => (
          <th key={c}>
            <div className="pv-table-head">
              <button
                className="pv-table-sort"
                aria-label={`Sort by column ${c + 1}`}
                onClick={() => onSort(c)}
              >
                {arrow(c)}
              </button>
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
