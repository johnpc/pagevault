import { useEffect, useRef, useState, type ReactNode } from 'react';
import { pb, isSignedIn } from '../../lib/pbClient';
import type { PresenceRecord } from '../../lib/pbClient';
import { fetchPresence, heartbeat, clearPresence } from './presenceApi';
import { activeViewers, blockCursors, ACTIVE_WINDOW_MS } from './activeViewers';
import { PresenceContext } from './PresenceContext';

const HEARTBEAT_MS = 15_000; // < ACTIVE_WINDOW_MS so a viewer stays live

/**
 * Owns the ONE heartbeat loop for the open page and shares live presence with
 * every consumer (avatars + block cursors). Beats now + on an interval + right
 * away whenever the focused block changes (so a moved cursor propagates fast),
 * refreshes on realtime events, expires stale viewers on a tick, and clears the
 * row on unmount.
 */
export function PresenceProvider({ pageId, children }: { pageId: string; children: ReactNode }) {
  const [rows, setRows] = useState<PresenceRecord[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [focused, setFocused] = useState('');
  const focusedRef = useRef('');

  useEffect(() => {
    if (!pageId || !isSignedIn()) return;
    let alive = true;
    const refresh = () => fetchPresence(pageId).then((r) => alive && setRows(r));
    const beat = () => heartbeat(pageId, focusedRef.current).then(refresh);

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    const tick = setInterval(() => alive && setNow(Date.now()), ACTIVE_WINDOW_MS / 3);
    const unsub = pb.collection('presence').subscribe<PresenceRecord>('*', (e) => {
      if (e.record.page === pageId) refresh();
    });

    return () => {
      alive = false;
      clearInterval(interval);
      clearInterval(tick);
      void unsub.then((fn) => fn());
      void clearPresence(pageId);
    };
  }, [pageId]);

  const setFocusedBlock = (blockId: string) => {
    if (blockId === focusedRef.current) return;
    focusedRef.current = blockId;
    setFocused(blockId);
    if (pageId && isSignedIn()) void heartbeat(pageId, blockId);
  };
  void focused; // state kept only to re-render this provider on focus change

  const selfId = pb.authStore.record?.id ?? '';
  const value = {
    viewers: activeViewers(rows, selfId, now),
    cursors: blockCursors(rows, selfId, now),
    setFocusedBlock,
  };
  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}
