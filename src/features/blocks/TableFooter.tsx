import type { TableData } from '../../lib/pbTypes';
import { setColumnSummary } from './tableData';
import { visibleColumns } from './tableColumns';
import { visibleRows } from './tableFilter';
import { cellText, type TitleMap } from './cellText';
import { summaryOptions, summaryLabel, summarize, type SummaryKind } from './tableSummary';
import { formatNumber } from './numberFormat';

// Summary kinds whose result is a value in the column's own units, so it should
// adopt the column's number format (count/unique/percent are counts, not).
const FORMATTABLE = new Set<SummaryKind>(['sum', 'avg', 'min', 'max', 'median', 'range']);

/** The table footer: one calculation per column over the VISIBLE (filtered)
 * rows. Each cell is a compact picker showing the result, or "Calculate" when
 * unset. Mirrors the head layout (drag spacer + columns + add-col spacer).
 * `titles` resolves relation cells so count/unique summaries count by page. */
export function TableFooter({
  data,
  save,
  titles,
}: {
  data: TableData;
  save: (next: TableData) => void;
  titles?: TitleMap;
}) {
  const rows = visibleRows(data, titles).map((v) => v.row);

  return (
    <tfoot>
      <tr className="pv-table-foot">
        <td className="pv-table-drag" aria-hidden="true" />
        {visibleColumns(data).map(({ column: col, index: c }) => {
          const kind = (col.summary ?? 'none') as SummaryKind;
          const raw = summarize(
            kind,
            rows.map((r) => cellText(col, r[c] ?? '', titles)),
          );
          // A numeric summary of a formatted number column adopts that format.
          const result = raw && FORMATTABLE.has(kind) ? formatNumber(raw, col.format) : raw;
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
