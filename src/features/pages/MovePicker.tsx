import type { PageRecord } from '../../lib/pbClient';
import { validMoveTargets } from './pageMove';
import { displayTitle } from './pageTree';

interface MovePickerProps {
  page: PageRecord;
  pages: PageRecord[];
  onMove: (parent: string) => void;
}

/** A "Move to…" select: reparent the page under Top level or another page
 * (excluding itself and its descendants, so no cycles). */
export function MovePicker({ page, pages, onMove }: MovePickerProps) {
  const targets = validMoveTargets(pages, page.id);
  return (
    <select
      className="pv-move-picker"
      aria-label="Move page under"
      value={page.parent}
      onChange={(e) => onMove(e.target.value)}
    >
      <option value="">Top level</option>
      {targets.map((t) => (
        <option key={t.id} value={t.id}>
          {t.icon || '📄'} {displayTitle(t)}
        </option>
      ))}
    </select>
  );
}
