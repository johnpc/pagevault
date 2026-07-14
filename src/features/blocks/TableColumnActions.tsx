import type { TableData } from '../../lib/pbTypes';
import { removeColumn } from './tableData';
import { toggleColumnHidden } from './tableColumns';
import { duplicateColumn } from './tableColumnOps';

/** The duplicate / hide / delete buttons for a column header. Delete is omitted
 * for the last remaining column. Render-only. */
export function TableColumnActions({
  data,
  c,
  save,
}: {
  data: TableData;
  c: number; // real column index
  save: (next: TableData) => void;
}) {
  return (
    <>
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
    </>
  );
}
