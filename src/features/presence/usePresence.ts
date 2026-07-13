import { useEffect, useState } from 'react';
import { pb, isSignedIn } from '../../lib/pbClient';
import type { PresenceRecord } from '../../lib/pbClient';
import { fetchPresence, heartbeat, clearPresence } from './presenceApi';
import { activeViewers, ACTIVE_WINDOW_MS, type Viewer } from './activeViewers';

const HEARTBEAT_MS = 15_000; // well under ACTIVE_WINDOW_MS so a viewer stays live

/**
 * Live presence for a page: send my heartbeat now + on an interval, subscribe to
 * the page's presence over realtime to refresh the viewer list, and expire stale
 * viewers on a timer. Returns the OTHER active viewers (never me). On unmount it
 * clears my row so I disappear from other people's stacks promptly.
 */
export function usePresence(pageId: string | undefined): Viewer[] {
  const [rows, setRows] = useState<PresenceRecord[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!pageId || !isSignedIn()) return;
    let alive = true;
    const refresh = () => fetchPresence(pageId).then((r) => alive && setRows(r));

    heartbeat(pageId).then(refresh);
    const beat = setInterval(() => heartbeat(pageId).then(refresh), HEARTBEAT_MS);
    // Re-tick so viewers whose heartbeat lapsed fall out of the active window.
    const tick = setInterval(() => alive && setNow(Date.now()), ACTIVE_WINDOW_MS / 3);

    const unsub = pb.collection('presence').subscribe<PresenceRecord>('*', (e) => {
      if (e.record.page === pageId) refresh();
    });

    return () => {
      alive = false;
      clearInterval(beat);
      clearInterval(tick);
      void unsub.then((fn) => fn());
      void clearPresence(pageId);
    };
  }, [pageId]);

  return activeViewers(rows, pb.authStore.record?.id ?? '', now);
}
