import type { TableData } from '../../lib/pbTypes';
import {
  conditions,
  addCondition,
  updateCondition,
  removeCondition,
  setFilterMatch,
} from './tableFilter';

/** Multi-condition row filter for a table: each condition picks a column + a
 * query. Conditions combine with AND ("all") or OR ("any") via the match toggle
 * (shown once there are 2+). "+ Filter" adds a condition; × removes one.
 * Non-destructive — conditions live on the grid data, not the rows. */
export function TableFilterBar({
  data,
  save,
}: {
  data: TableData;
  save: (next: TableData) => void;
}) {
  const rows = conditions(data);
  const mode = data.filterMatch === 'any' ? 'any' : 'all';
  const connector = mode === 'any' ? 'or' : 'and';

  return (
    <div className="pv-table-filter">
      {rows.map((f, i) => (
        <div className="pv-table-filter-row" key={i}>
          {i === 0 ? (
            <span className="pv-table-filter-label" aria-hidden="true">
              ⧩
            </span>
          ) : (
            <span className="pv-table-filter-and">{connector}</span>
          )}
          <select
            aria-label={`Filter ${i + 1} column`}
            value={f.col}
            onChange={(e) => save(updateCondition(data, i, { col: Number(e.target.value) }))}
          >
            {data.columns.map((c, j) => (
              <option key={j} value={j}>
                {c.name || `Column ${j + 1}`}
              </option>
            ))}
          </select>
          <input
            aria-label={`Filter ${i + 1} query`}
            placeholder="contains…"
            value={f.query}
            onChange={(e) => save(updateCondition(data, i, { query: e.target.value }))}
          />
          <button
            className="pv-table-filter-clear"
            aria-label={`Remove filter ${i + 1}`}
            onClick={() => save(removeCondition(data, i))}
          >
            ×
          </button>
        </div>
      ))}
      <div className="pv-table-filter-row">
        <button
          className="pv-table-filter-add pv-muted"
          aria-label="Add filter"
          onClick={() => save(addCondition(data))}
        >
          + Filter
        </button>
        {rows.length >= 2 && (
          <label className="pv-table-filter-match">
            match
            <select
              aria-label="Filter match mode"
              value={mode}
              onChange={(e) => save(setFilterMatch(data, e.target.value as 'all' | 'any'))}
            >
              <option value="all">all</option>
              <option value="any">any</option>
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
