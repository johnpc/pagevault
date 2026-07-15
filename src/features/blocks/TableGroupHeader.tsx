import { Tag } from './Tag';

/** A collapsible section header row in a grouped table: a disclosure toggle, the
 * group's label, and its row count. Split out of TableBody to keep that under
 * the line limit. `span` covers every column (+ the drag & delete columns). A
 * non-empty group `value` (the select option) shows as a colored tag pill for
 * parity with the cells; the empty "No <col>" group keeps its plain label. */
export function TableGroupHeader({
  value,
  label,
  count,
  collapsed,
  span,
  onToggle,
}: {
  value: string;
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
          {collapsed ? '▸' : '▾'} {value ? <Tag label={value} /> : label}{' '}
          <span className="pv-muted">{count}</span>
        </button>
      </td>
    </tr>
  );
}
