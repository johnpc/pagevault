import { tagColor } from './tagColor';

/** A colored option pill for select / multiselect cells. The color is derived
 * deterministically from the label (see tagColor) so a tag looks the same in
 * the cell summary and the picker. Render-only. */
export function Tag({ label }: { label: string }) {
  return <span className={`pv-tag pv-tag--${tagColor(label)}`}>{label}</span>;
}
