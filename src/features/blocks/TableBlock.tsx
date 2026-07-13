import { useState } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import type { TableData } from '../../lib/pbTypes';
import { normalize, addRow } from './tableData';
import { sortByColumn } from './tableSort';
import { TableHead } from './TableHead';
import { TableBody } from './TableBody';
import { TableBoard } from './TableBoard';
import { TableViewToggle } from './TableViewToggle';
import { TableFilterBar } from './TableFilterBar';
import './TableBlock.css';

/** An editable typed table/database grid. The whole grid lives in the block's
 * `data` JSON field; every edit patches it via onEdit. Render-only — grid logic
 * is in the pure tableData helpers; rows drag to reorder, headers click to sort. */
export function TableBlock({
  block,
  onEdit,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
}) {
  const data = normalize(block.data as TableData | null);
  const save = (next: TableData) => onEdit(block.id, { data: next });
  // Which column is sorted, and which way — transient (not persisted); a click
  // cycles asc → desc and rewrites the stored row order.
  const [sort, setSort] = useState<{ col: number; dir: 'asc' | 'desc' } | null>(null);

  const onSort = (col: number) => {
    const dir = sort?.col === col && sort.dir === 'asc' ? 'desc' : 'asc';
    setSort({ col, dir });
    save(sortByColumn(data, col, dir));
  };

  return (
    <div className="pv-table-wrap">
      <TableViewToggle data={data} onView={(view) => save({ ...data, view })} />
      {data.view === 'board' ? (
        <TableBoard data={data} save={save} />
      ) : (
        <>
          <TableFilterBar data={data} save={save} />
          <table className="pv-table">
            <TableHead data={data} save={save} onSort={onSort} sort={sort} />
            <TableBody data={data} save={save} />
          </table>
          <button className="pv-table-addrow pv-muted" onClick={() => save(addRow(data))}>
            + Add row
          </button>
        </>
      )}
    </div>
  );
}
