import './Skeleton.css';

/** A content-shaped loading placeholder: `rows` shimmer bars that stand in for
 * list items while data loads (Notion-style), instead of a bare spinner. Pure
 * presentational; the aria-busy region announces the load to assistive tech. */
export function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="pv-skeleton" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="pv-skeleton-row" />
      ))}
    </div>
  );
}
