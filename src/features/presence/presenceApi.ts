/**
 * Presence server-state: a per-viewer heartbeat row per page. The heartbeat is
 * upserted against the unique (page,user) index — find the caller's row and
 * touch it, else create it. Reads expand `user` so the avatar has a name.
 */
import { pb, currentUserId } from '../../lib/pbClient';
import type { PresenceRecord } from '../../lib/pbClient';

/** All presence rows for a page (viewers), with the user expanded for labels. */
export function fetchPresence(pageId: string): Promise<PresenceRecord[]> {
  return pb
    .collection('presence')
    .getFullList<PresenceRecord>({ filter: `page = '${pageId}'`, expand: 'user' });
}

// Serialize heartbeats per page: two near-simultaneous beats (mount + focus, or
// StrictMode's double-invoke) would each find no row and both CREATE, and the
// second 400s on the unique (page,user) index. Chaining them means the second
// runs after the first has created the row, so it finds + updates instead.
const inFlight = new Map<string, Promise<void>>();

async function runHeartbeat(pageId: string, block: string): Promise<void> {
  const user = currentUserId();
  if (!user) return;
  const find = () =>
    pb
      .collection('presence')
      .getFirstListItem<PresenceRecord>(`page = '${pageId}' && user = '${user}'`)
      .catch(() => null);
  const existing = await find();
  if (existing) {
    await pb
      .collection('presence')
      .update(existing.id, { user, block })
      .catch(() => undefined);
    return;
  }
  try {
    await pb.collection('presence').create({ page: pageId, user, block });
  } catch {
    // Lost a create race (unique page+user) — re-find and touch the winning row.
    const row = await find();
    if (row)
      await pb
        .collection('presence')
        .update(row.id, { user, block })
        .catch(() => undefined);
  }
}

/**
 * Send a heartbeat: create the caller's presence row for this page, or touch it
 * if it already exists (its `updated` autodate advances on any save). `block` is
 * the focused block id ('' = none), persisted so other viewers see a live cursor.
 * Idempotent + serialized per page — safe to call repeatedly / concurrently.
 */
export function heartbeat(pageId: string, block = ''): Promise<void> {
  const prior = inFlight.get(pageId) ?? Promise.resolve();
  const next = prior.then(() => runHeartbeat(pageId, block));
  // Keep the chain alive but don't leak rejections into it.
  inFlight.set(
    pageId,
    next.catch(() => undefined),
  );
  return next;
}

/** Remove the caller's presence row for a page (on leave). Best-effort. */
export async function clearPresence(pageId: string): Promise<void> {
  const user = currentUserId();
  if (!user) return;
  const existing = await pb
    .collection('presence')
    .getFirstListItem<PresenceRecord>(`page = '${pageId}' && user = '${user}'`)
    .catch(() => null);
  if (existing)
    await pb
      .collection('presence')
      .delete(existing.id)
      .catch(() => undefined);
}
