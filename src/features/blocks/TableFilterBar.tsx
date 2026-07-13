import { useState } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { setFilter } from './tableFilter';

/** A one-column filter control for a table: pick a column + type a query to show
 * only matching rows (non-destructive — the underlying data is untouched). A
 * blank query clears the stored filter, but the CHOSEN column is kept in local
 * state so selecting a column before typing doesn't get forgotten. */
export function TableFilterBar({
  data,
  save,
}: {
  data: TableData;
  save: (next: TableData) => void;
}) {
  // The active filter's column wins; otherwise remember the last picked column
  // locally so an empty query (which clears data.filter) doesn't reset it.
  const [pickedCol, setPickedCol] = useState(0);
  const col = data.filter?.col ?? pickedCol;
  const query = data.filter?.query ?? '';

  return (
    <div className="pv-table-filter">
      <span className="pv-table-filter-label" aria-hidden="true">
        ⧩
      </span>
      <select
        aria-label="Filter column"
        value={col}
        onChange={(e) => {
          const next = Number(e.target.value);
          setPickedCol(next);
          save(setFilter(data, next, query));
        }}
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
