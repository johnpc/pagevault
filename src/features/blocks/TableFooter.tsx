import type { TableData } from '../../lib/pbTypes';
import { setColumnSummary } from './tableData';
import { visibleColumns } from './tableColumns';
import { visibleRows } from './tableFilter';
import { summaryOptions, summaryLabel, summarize, type SummaryKind } from './tableSummary';

/** The table footer: one calculation per column over the VISIBLE (filtered)
 * rows. Each cell is a compact picker showing the result, or "Calculate" when
 * unset. Mirrors the head layout (drag spacer + columns + add-col spacer). */
export function TableFooter({ data, save }: { data: TableData; save: (next: TableData) => void }) {
  const rows = visibleRows(data).map((v) => v.row);

  return (
    <tfoot>
      <tr className="pv-table-foot">
        <td className="pv-table-drag" aria-hidden="true" />
        {visibleColumns(data).map(({ column: col, index: c }) => {
          const kind = (col.summary ?? 'none') as SummaryKind;
          const result = summarize(
            kind,
            rows.map((r) => r[c] ?? ''),
          );
          return (
            <td key={c}>
              <label className="pv-table-summary">
                <span className="pv-table-summary-value">
                  {kind === 'none' ? summaryLabel('none') : result}
                </span>
                <select
                  aria-label={`Summary for column ${c + 1}`}
                  value={kind}
                  onChange={(e) => save(setColumnSummary(data, c, e.target.value))}
                >
                  {summaryOptions(col.type).map((k) => (
                    <option key={k} value={k}>
                      {summaryLabel(k)}
                    </option>
                  ))}
                </select>
              </label>
            </td>
          );
        })}
        <td className="pv-table-addcol" aria-hidden="true" />
      </tr>
    </tfoot>
  );
}
