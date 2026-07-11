import type { BlockRecord } from '../../lib/pbClient';
import type { TableData } from '../../lib/pbTypes';
import { normalize, setCell, addRow, removeRow } from './tableData';
import { TableHead } from './TableHead';
import { TableCell } from './TableCell';
import './TableBlock.css';

/** An editable typed table/database grid. The whole grid lives in the block's
 * `data` JSON field; every edit patches it via onEdit. Render-only — all grid
 * logic is in the pure tableData helpers, cells render by column type. */
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
        <TableHead data={data} save={save} />
        <tbody>
          {data.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <TableCell
                    column={data.columns[c]}
                    value={cell}
                    label={`Cell ${r + 1},${c + 1}`}
                    onChange={(v) => save(setCell(data, r, c, v))}
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
