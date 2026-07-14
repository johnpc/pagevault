import { useCallback, useMemo, useState } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import type { TableData } from '../../lib/pbTypes';
import { usePages } from '../pages/pagesApi';
import { displayTitle } from '../pages/pageTree';
import { normalize } from './tableData';
import { sortByColumn } from './tableSort';
import type { TitleMap } from './cellText';
import { TableViewBody } from './TableViewBody';
import { TableViewToggle } from './TableViewToggle';
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
  // Normalize only when the stored data actually changes — a presence heartbeat
  // or sibling edit re-renders this block, and rebuilding every row/column array
  // each time would churn the whole grid.
  const data = useMemo(() => normalize(block.data as TableData | null), [block.data]);
  const save = useCallback(
    (next: TableData) => onEdit(block.id, { data: next }),
    [onEdit, block.id],
  );
  // Map page id → title so relation cells sort/filter/summarize by name. Memoized
  // on the page list so a stable object flows into the grid between edits.
  const pages = usePages();
  const titles: TitleMap = useMemo(() => {
    const map: TitleMap = {};
    for (const p of pages.data ?? []) map[p.id] = displayTitle(p);
    return map;
  }, [pages.data]);
  // Which column is sorted, and which way — transient (not persisted); a click
  // cycles asc → desc and rewrites the stored row order.
  const [sort, setSort] = useState<{ col: number; dir: 'asc' | 'desc' } | null>(null);

  const onSort = useCallback(
    (col: number) => {
      const dir = sort?.col === col && sort.dir === 'asc' ? 'desc' : 'asc';
      setSort({ col, dir });
      save(sortByColumn(data, col, dir, titles));
    },
    [sort, save, data, titles],
  );

  const view = data.view ?? 'table';
  return (
    <div className="pv-table-wrap">
      <TableViews data={data} save={save} />
      <TableViewToggle data={data} onView={(v) => save({ ...data, view: v })} />
      <TableViewBody
        view={view}
        data={data}
        save={save}
        titles={titles}
        sort={sort}
        onSort={onSort}
      />
    </div>
  );
}
