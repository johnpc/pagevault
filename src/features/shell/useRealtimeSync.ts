import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { pb, isSignedIn } from '../../lib/pbClient';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';

/**
 * Live sync: subscribe to this user's `pages` and `blocks` over PocketBase
 * realtime and invalidate the matching react-query keys on every change, so an
 * edit made in one tab/device shows up in all open views without a reload. The
 * owner-scoped collection rules mean the stream only ever carries this user's
 * records, so no client-side owner filtering is needed.
 *
 * Field-level reconciliation (not clobbering a focused input) lives in the
 * editors via useReconciled; this hook only keeps the cache fresh.
 */
export function useRealtimeSync() {
  const qc = useQueryClient();
  useEffect(() => {
    if (!isSignedIn()) return;
    const unsubs: Array<Promise<() => void>> = [
      pb.collection('pages').subscribe<PageRecord>('*', (e) => {
        qc.invalidateQueries({ queryKey: ['pages'] });
        qc.invalidateQueries({ queryKey: ['page', e.record.id] });
      }),
      pb.collection('blocks').subscribe<BlockRecord>('*', (e) => {
        qc.invalidateQueries({ queryKey: ['blocks', e.record.page] });
      }),
    ];
    return () => {
      unsubs.forEach((u) => void u.then((fn) => fn()));
    };
  }, [qc]);
}
