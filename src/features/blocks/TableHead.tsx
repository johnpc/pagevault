import type { TableData } from '../../lib/pbTypes';
import { addColumn } from './tableData';
import { visibleColumns } from './tableColumns';
import { TableColumnHead } from './TableColumnHead';
import { useColumnDnd } from './useColumnDnd';

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

/** The table header row: a drag-column spacer, a header cell per visible column
 * (name/type/sort + duplicate/hide/delete), and the add-column button. */
export function TableHead({ data, save, onSort, sort }: HeadProps) {
  const arrow = (c: number) => (sort?.col !== c ? '↕' : sort.dir === 'asc' ? '▲' : '▼');
  const dnd = useColumnDnd(data, save);
  return (
    <thead>
      <tr>
        <th className="pv-table-drag" aria-hidden="true" />
        {visibleColumns(data).map(({ column: col, index: c }) => (
          <TableColumnHead
            key={c}
            data={data}
            col={col}
            c={c}
            save={save}
            onSort={onSort}
            arrow={arrow(c)}
            dragging={dnd.dragCol === c}
            cellProps={dnd.cellProps(c)}
            handleProps={dnd.handleProps(c)}
          />
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
