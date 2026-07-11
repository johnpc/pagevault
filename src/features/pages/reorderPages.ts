import type { PageRecord } from '../../lib/pbClient';
import { sortUpdates } from '../blocks/reorder';

/**
 * Reorder a page among its siblings (pages sharing the same `parent`): move
 * `fromId` to sit just before `toId`. Only same-parent drops reorder — a drop
 * onto a page in a different branch is a no-op here (reparenting stays with the
 * Move picker). Returns the {id, sort} updates to persist, or [] when nothing
 * changes. Pure — no I/O.
 */
export function reorderSiblings(
  pages: PageRecord[],
  fromId: string,
  toId: string,
): { id: string; sort: number }[] {
  if (fromId === toId) return [];
  const from = pages.find((p) => p.id === fromId);
  const to = pages.find((p) => p.id === toId);
  if (!from || !to || from.parent !== to.parent) return [];

  const siblings = pages
    .filter((p) => p.parent === from.parent)
    .sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title));
  const rest = siblings.filter((p) => p.id !== fromId);
  const toIdx = rest.findIndex((p) => p.id === toId);
  rest.splice(toIdx, 0, from);
  return sortUpdates(rest);
}
