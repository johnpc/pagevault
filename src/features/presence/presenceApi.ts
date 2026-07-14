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

/**
 * Send a heartbeat: create the caller's presence row for this page, or touch it
 * if it already exists (its `updated` autodate advances on any save). `block` is
 * the id of the block the viewer is focused in ('' = none) — persisted so other
 * viewers can render a live cursor there. Idempotent — safe to call repeatedly.
 */
export async function heartbeat(pageId: string, block = ''): Promise<void> {
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
    // A concurrent heartbeat may have created the row first (unique page+user) —
    // re-find and touch it instead of surfacing the create's 400.
    const row = await find();
    if (row)
      await pb
        .collection('presence')
        .update(row.id, { user, block })
        .catch(() => undefined);
  }
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
