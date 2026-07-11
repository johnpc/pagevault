import type { BlockRecord } from '../../lib/pbClient';
import type { TableData } from '../../lib/pbTypes';
import {
  normalize,
  setCell,
  setColumn,
  addRow,
  addColumn,
  removeRow,
  removeColumn,
} from './tableData';
import './TableBlock.css';

/** An editable table/database grid. The whole grid lives in the block's `data`
 * JSON field; every edit patches it via onEdit. Render-only — all grid logic is
 * in the pure tableData helpers. */
export function TableBlock({
  block,
  onEdit,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
}) {
  const data = normalize(block.data);
  const save = (next: TableData) => onEdit(block.id, { data: next });

  return (
    <div className="pv-table-wrap">
      <table className="pv-table">
        <thead>
          <tr>
            {data.columns.map((col, c) => (
              <th key={c}>
                <input
                  aria-label={`Column ${c + 1} name`}
                  value={col}
                  onChange={(e) => save(setColumn(data, c, e.target.value))}
                />
                {data.columns.length > 1 && (
                  <button
                    className="pv-table-del"
                    aria-label={`Delete column ${c + 1}`}
                    onClick={() => save(removeColumn(data, c))}
                  >
                    ×
                  </button>
                )}
              </th>
            ))}
            <th className="pv-table-addcol">
              <button aria-label="Add column" onClick={() => save(addColumn(data))}>
                +
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <input
                    aria-label={`Cell ${r + 1},${c + 1}`}
                    value={cell}
                    onChange={(e) => save(setCell(data, r, c, e.target.value))}
                  />
                </td>
              ))}
              <td className="pv-table-rowdel">
                {data.rows.length > 1 && (
                  <button
                    aria-label={`Delete row ${r + 1}`}
                    onClick={() => save(removeRow(data, r))}
                  >
                    ×
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="pv-table-addrow pv-muted" onClick={() => save(addRow(data))}>
        + Add row
      </button>
    </div>
  );
}
