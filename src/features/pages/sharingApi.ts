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

/** The public page for a share token (anonymous-readable). */
export function usePublicPage(token: string | undefined) {
  return useQuery({
    queryKey: ['shared', token],
    enabled: !!token,
    queryFn: () =>
      pb
        .collection('pages')
        .getFirstListItem<PageRecord>(`shareToken = "${token}" && isPublic = true`),
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
