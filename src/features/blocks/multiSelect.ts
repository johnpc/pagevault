/** A multi-select cell stores its chosen options as a comma-joined string
 * (e.g. "Red,Blue"). These pure helpers split/join/toggle that value; the
 * comma-join keeps the existing substring filter ("Red" matches "Red,Blue")
 * and text sort working with no special-casing. */

/** The selected options in a multi-select cell, in stored order, blanks
 * dropped. Pure. */
export function selectedValues(cell: string): string[] {
  return cell
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '');
}

/** Whether `option` is currently selected in the cell. Pure. */
export function isSelected(cell: string, option: string): boolean {
  return selectedValues(cell).includes(option);
}

/** Toggle `option` in the cell, returning the new comma-joined value. Adding
 * keeps the column's option order (`order`); removing preserves the rest. Pure. */
export function toggleValue(cell: string, option: string, order: string[]): string {
  const current = selectedValues(cell);
  const next = current.includes(option)
    ? current.filter((v) => v !== option)
    : [...current, option];
  // Re-order by the column's declared option order for a stable display.
  return order.filter((o) => next.includes(o)).join(',');
}
