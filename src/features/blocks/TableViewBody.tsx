import type { TableData, TableViewMode } from '../../lib/pbTypes';
import type { TitleMap } from './cellText';
import { TableBoard } from './TableBoard';
import { TableGrid } from './TableGrid';
import { GalleryView } from './GalleryView';
import { CalendarView } from './CalendarView';
import { TableFilterBar } from './TableFilterBar';
import { TableProperties } from './TableProperties';
import { TableGroupToggle } from './TableGroupToggle';

/** Renders the body for the active table view. Board and Calendar carry their
 * own controls (no toolbar); Table and Gallery share the filter + Properties
 * toolbar. Render-only. */
export function TableViewBody({
  view,
  data,
  save,
  titles,
  sort,
  onSort,
}: {
  view: TableViewMode;
  data: TableData;
  save: (next: TableData) => void;
  titles: TitleMap;
  sort: { col: number; dir: 'asc' | 'desc' } | null;
  onSort: (col: number) => void;
}) {
  if (view === 'board') return <TableBoard data={data} save={save} />;
  if (view === 'calendar') return <CalendarView data={data} save={save} />;
  return (
    <>
      <div className="pv-table-toolbar">
        <TableFilterBar data={data} save={save} />
        {view === 'table' && <TableGroupToggle data={data} save={save} />}
        <TableProperties data={data} save={save} />
      </div>
      {view === 'gallery' ? (
        <GalleryView data={data} save={save} titles={titles} />
      ) : (
        <TableGrid data={data} save={save} titles={titles} sort={sort} onSort={onSort} />
      )}
    </>
  );
}
