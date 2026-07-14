/**
 * Public-sharing server-state. Toggling share sets isPublic + a shareToken;
 * the public read hooks fetch a page + its blocks by token WITHOUT auth (the
 * backend rules allow anonymous reads only for isPublic pages).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';
import { makeShareToken } from './sharing';

/** Turn sharing on (generating a token if needed) or off for a page. */
export function useSetShared() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { page: PageRecord; isPublic: boolean }) => {
      const shareToken = input.page.shareToken || (input.isPublic ? makeShareToken() : '');
      return pb
        .collection('pages')
        .update<PageRecord>(input.page.id, { isPublic: input.isPublic, shareToken });
    },
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: ['pages'], exact: false });
      qc.invalidateQueries({ queryKey: ['page', page.id] });
    },
  });
}

/** The public page for a share token (anonymous-readable), or null when the
 * token matches no shared page. A missing/revoked token is NOT an error — the
 * backend 404s when getFirstListItem finds nothing, so we translate that to null
 * and let the caller show the "not shared" empty state (rather than a spurious
 * connection-error + Retry). Real network failures still reject. */
export function usePublicPage(token: string | undefined) {
  return useQuery({
    queryKey: ['shared', token],
    enabled: !!token,
    queryFn: async () => {
      try {
        return await pb
          .collection('pages')
          .getFirstListItem<PageRecord>(`shareToken = "${token}" && isPublic = true`);
      } catch (e) {
        if ((e as { status?: number }).status === 404) return null;
        throw e;
      }
    },
  });
}

/** The blocks of a public page (anonymous-readable). */
export function usePublicBlocks(pageId: string | undefined) {
  return useQuery({
    queryKey: ['shared-blocks', pageId],
    enabled: !!pageId,
    queryFn: () =>
      pb
        .collection('blocks')
        .getFullList<BlockRecord>({ filter: `page = '${pageId}'`, sort: 'sort' }),
  });
}
