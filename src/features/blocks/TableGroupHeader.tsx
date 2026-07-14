/** A collapsible section header row in a grouped table: a disclosure toggle, the
 * group's label, and its row count. Split out of TableBody to keep that under
 * the line limit. `span` covers every column (+ the drag & delete columns). */
export function TableGroupHeader({
  label,
  count,
  collapsed,
  span,
  onToggle,
}: {
  label: string;
  count: number;
  collapsed: boolean;
  span: number;
  onToggle: () => void;
}) {
  return (
    <tr className="pv-table-grouphead">
      <td colSpan={span}>
        <button aria-expanded={!collapsed} aria-label={`Group ${label}`} onClick={onToggle}>
          {collapsed ? '▸' : '▾'} {label} <span className="pv-muted">{count}</span>
        </button>
      </td>
    </tr>
  );
}
