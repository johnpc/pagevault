import type { TableData } from '../../lib/pbTypes';
import type { TitleMap } from './cellText';
import { addRow } from './tableData';
import { TableHead } from './TableHead';
import { TableBody } from './TableBody';
import { TableFooter } from './TableFooter';

/** The spreadsheet grid body of a table block: header (click to sort), rows,
 * and the summary footer, plus the add-row button. Render-only. */
export function TableGrid({
  data,
  save,
  titles,
  sort,
  onSort,
}: {
  data: TableData;
  save: (next: TableData) => void;
  titles: TitleMap;
  sort: { col: number; dir: 'asc' | 'desc' } | null;
  onSort: (col: number) => void;
}) {
  return (
    <>
      <table className="pv-table">
        <TableHead data={data} save={save} onSort={onSort} sort={sort} />
        <TableBody data={data} save={save} titles={titles} />
        <TableFooter data={data} save={save} titles={titles} />
      </table>
      <button className="pv-table-addrow pv-muted" onClick={() => save(addRow(data))}>
        + Add row
      </button>
    </>
  );
}
