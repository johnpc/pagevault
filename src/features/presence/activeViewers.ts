import type { PresenceRecord } from '../../lib/pbClient';

/** A viewer to show as an avatar: a stable id + a display label + its initial. */
export interface Viewer {
  id: string;
  label: string;
  initial: string;
}

/** How long after its last heartbeat a presence row counts as "active" (ms). */
export const ACTIVE_WINDOW_MS = 30_000;

/** A viewer's display label from the expanded user (name, else email local
 * part, else a short id). Pure. */
export function viewerLabel(row: PresenceRecord): string {
  const u = row.expand?.user;
  if (u?.name) return u.name;
  if (u?.email) return u.email.split('@')[0];
  return row.user.slice(0, 6);
}

/** A viewer with the block they're focused in (for live cursors). */
export interface ViewerAt extends Viewer {
  block: string;
}

/** Active presence rows: within the window, excluding self, one per user (the
 * most recent row wins since rows arrive newest-touched). Pure. */
function activeRows(rows: PresenceRecord[], selfId: string, now: number): ViewerAt[] {
  const seen = new Set<string>();
  const out: ViewerAt[] = [];
  for (const row of rows) {
    if (row.user === selfId || seen.has(row.user)) continue;
    if (now - new Date(row.updated).getTime() > ACTIVE_WINDOW_MS) continue;
    seen.add(row.user);
    const label = viewerLabel(row);
    out.push({ id: row.user, label, initial: (label[0] ?? '?').toUpperCase(), block: row.block });
  }
  return out;
}

/**
 * The other people currently viewing a page, sorted by label for a stable
 * avatar order. `now` is injected so this is deterministic under test. Pure.
 */
export function activeViewers(rows: PresenceRecord[], selfId: string, now: number): Viewer[] {
  return activeRows(rows, selfId, now).sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Live cursors keyed by block id: for each block another active viewer is
 * focused in, the viewers there (sorted by label). Blocks with no other viewer
 * are absent from the map. Pure.
 */
export function blockCursors(
  rows: PresenceRecord[],
  selfId: string,
  now: number,
): Record<string, ViewerAt[]> {
  const map: Record<string, ViewerAt[]> = {};
  for (const v of activeRows(rows, selfId, now)) {
    if (!v.block) continue;
    (map[v.block] ??= []).push(v);
  }
  for (const list of Object.values(map)) list.sort((a, b) => a.label.localeCompare(b.label));
  return map;
}
