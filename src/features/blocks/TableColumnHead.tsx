import type { TableColumn, TableColumnType, TableData } from '../../lib/pbTypes';
import { setColumn, setColumnType, removeColumn } from './tableData';
import { toggleColumnHidden } from './tableColumns';
import { duplicateColumn } from './tableColumnOps';

const TYPES: TableColumnType[] = ['text', 'number', 'checkbox', 'select', 'date', 'relation'];

interface ColumnHeadProps {
  data: TableData;
  col: TableColumn;
  c: number; // real column index
  save: (next: TableData) => void;
  onSort: (col: number) => void;
  arrow: string;
  dragging: boolean;
  cellProps: React.HTMLAttributes<HTMLTableCellElement>;
  handleProps: React.HTMLAttributes<HTMLButtonElement>;
}

/** One table header cell: drag grip, sort toggle, name input, type picker, and
 * the duplicate / hide / delete controls for the column. Render-only. */
export function TableColumnHead({
  data,
  col,
  c,
  save,
  onSort,
  arrow,
  dragging,
  cellProps,
  handleProps,
}: ColumnHeadProps) {
  return (
    <th className={dragging ? 'pv-table-col--dragging' : ''} {...cellProps}>
      <div className="pv-table-head">
        <button className="pv-table-colgrip" aria-label={`Drag column ${c + 1}`} {...handleProps}>
          ⠿
        </button>
        <button
          className="pv-table-sort"
          aria-label={`Sort by column ${c + 1}`}
          onClick={() => onSort(c)}
        >
          {arrow}
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
        <button
          className="pv-table-dupcol"
          aria-label={`Duplicate column ${c + 1}`}
          title="Duplicate column"
          onClick={() => save(duplicateColumn(data, c))}
        >
          ⧉
        </button>
        <button
          className="pv-table-hide"
          aria-label={`Hide column ${c + 1}`}
          title="Hide column"
          onClick={() => save(toggleColumnHidden(data, c, true))}
        >
          ⊘
        </button>
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
  );
}
