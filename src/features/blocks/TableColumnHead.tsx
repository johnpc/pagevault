import type { TableColumn, TableColumnType, TableData } from '../../lib/pbTypes';
import { setColumn, setColumnType } from './tableData';
import { setColumnWrap } from './tableColumnFields';
import { ColumnFormatPicker } from './ColumnFormatPicker';
import { TableColumnActions } from './TableColumnActions';
import { COLUMN_TYPES } from './tableColumnTypes';

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
          {COLUMN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {(col.type === 'number' || col.type === 'date') && (
          <ColumnFormatPicker data={data} c={c} format={col.format} kind={col.type} save={save} />
        )}
        {col.type === 'text' && (
          <button
            className={`pv-table-wrap-btn${col.wrap ? ' pv-table-wrap-btn--on' : ''}`}
            aria-label={`Wrap text in column ${c + 1}`}
            aria-pressed={!!col.wrap}
            title="Wrap text"
            onClick={() => save(setColumnWrap(data, c, !col.wrap))}
          >
            ↵
          </button>
        )}
        <TableColumnActions data={data} c={c} save={save} />
      </div>
    </th>
  );
}
