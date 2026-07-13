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

/**
 * The other people currently viewing a page: presence rows whose last heartbeat
 * is within ACTIVE_WINDOW_MS of `now`, excluding the current user, de-duped by
 * user, sorted by label for a stable avatar order. `now` is injected so this is
 * deterministic under test. Pure.
 */
export function activeViewers(rows: PresenceRecord[], selfId: string, now: number): Viewer[] {
  const seen = new Set<string>();
  const out: Viewer[] = [];
  for (const row of rows) {
    if (row.user === selfId || seen.has(row.user)) continue;
    if (now - new Date(row.updated).getTime() > ACTIVE_WINDOW_MS) continue;
    seen.add(row.user);
    const label = viewerLabel(row);
    out.push({ id: row.user, label, initial: (label[0] ?? '?').toUpperCase() });
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}
