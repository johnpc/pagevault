import { useState } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import type { TableData } from '../../lib/pbTypes';
import { usePages } from '../pages/pagesApi';
import { displayTitle } from '../pages/pageTree';
import { normalize } from './tableData';
import { sortByColumn } from './tableSort';
import type { TitleMap } from './cellText';
import { TableBoard } from './TableBoard';
import { TableGrid } from './TableGrid';
import { GalleryView } from './GalleryView';
import { TableViewToggle } from './TableViewToggle';
import { TableFilterBar } from './TableFilterBar';
import { TableProperties } from './TableProperties';
import { TableViews } from './TableViews';
import './TableBlock.css';

/** An editable typed table/database grid. The whole grid lives in the block's
 * `data` JSON field; every edit patches it via onEdit. Render-only — grid logic
 * is in the pure tableData helpers; rows drag to reorder, headers click to sort.
 * The same data renders as a Table, a kanban Board, or a Gallery of cards. */
export function TableBlock({
  block,
  onEdit,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
}) {
  const data = normalize(block.data as TableData | null);
  const save = (next: TableData) => onEdit(block.id, { data: next });
  // Map page id → title so relation cells sort/filter/summarize by name.
  const pages = usePages();
  const titles: TitleMap = {};
  for (const p of pages.data ?? []) titles[p.id] = displayTitle(p);
  // Which column is sorted, and which way — transient (not persisted); a click
  // cycles asc → desc and rewrites the stored row order.
  const [sort, setSort] = useState<{ col: number; dir: 'asc' | 'desc' } | null>(null);

  const onSort = (col: number) => {
    const dir = sort?.col === col && sort.dir === 'asc' ? 'desc' : 'asc';
    setSort({ col, dir });
    save(sortByColumn(data, col, dir, titles));
  };

  const view = data.view ?? 'table';
  return (
    <div className="pv-table-wrap">
      <TableViews data={data} save={save} />
      <TableViewToggle data={data} onView={(v) => save({ ...data, view: v })} />
      {view === 'board' ? (
        <TableBoard data={data} save={save} />
      ) : (
        <>
          <div className="pv-table-toolbar">
            <TableFilterBar data={data} save={save} />
            <TableProperties data={data} save={save} />
          </div>
          {view === 'gallery' ? (
            <GalleryView data={data} save={save} titles={titles} />
          ) : (
            <TableGrid data={data} save={save} titles={titles} sort={sort} onSort={onSort} />
          )}
        </>
      )}
    </div>
  );
}
