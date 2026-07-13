import type { TableData } from '../../lib/pbTypes';
import { setFilter } from './tableFilter';

/** A one-column filter control for a table: pick a column + type a query to show
 * only matching rows (non-destructive — the underlying data is untouched). A
 * blank query clears the filter. Render-only; state lives in the grid `data`. */
export function TableFilterBar({
  data,
  save,
}: {
  data: TableData;
  save: (next: TableData) => void;
}) {
  const col = data.filter?.col ?? 0;
  const query = data.filter?.query ?? '';

  return (
    <div className="pv-table-filter">
      <span className="pv-table-filter-label" aria-hidden="true">
        ⧩
      </span>
      <select
        aria-label="Filter column"
        value={col}
        onChange={(e) => save(setFilter(data, Number(e.target.value), query))}
      >
        {data.columns.map((c, i) => (
          <option key={i} value={i}>
            {c.name || `Column ${i + 1}`}
          </option>
        ))}
      </select>
      <input
        aria-label="Filter query"
        placeholder="Filter…"
        value={query}
        onChange={(e) => save(setFilter(data, col, e.target.value))}
      />
      {query && (
        <button
          className="pv-table-filter-clear"
          aria-label="Clear filter"
          onClick={() => save(setFilter(data, col, ''))}
        >
          ×
        </button>
      )}
    </div>
  );
}
