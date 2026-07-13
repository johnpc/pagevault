/**
 * Collaboration server-state: invite links + memberships. An owner creates an
 * invite link on a page (a token + the role it grants); a signed-in user opens
 * the link and joins via the server-authoritative hook, which sets the role and
 * creates the membership — a client can never self-escalate or read a page by
 * guessing its id (the token is a secret checked only server-side).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pb } from '../../lib/pbClient';
import type { PageRecord } from '../../lib/pbClient';
import type { ShareRole } from '../../lib/pbTypes';
import { makeShareToken } from './sharing';

/** The minimal invite-landing payload from GET /api/invite/{token}. */
export interface InvitePreview {
  pageId: string;
  title: string;
  icon: string;
  role: ShareRole;
}

/** Owner: create (or refresh) a page's invite link at the given role. */
export function useSetInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { page: PageRecord; role: ShareRole }) =>
      pb.collection('pages').update<PageRecord>(input.page.id, {
        inviteToken: input.page.inviteToken || makeShareToken(),
        inviteRole: input.role,
      }),
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: ['pages'], exact: false });
      qc.invalidateQueries({ queryKey: ['page', page.id] });
    },
  });
}

/** Owner: revoke a page's invite link (existing members keep their access). */
export function useRevokeInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (page: PageRecord) =>
      pb.collection('pages').update<PageRecord>(page.id, { inviteToken: '', inviteRole: '' }),
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: ['pages'], exact: false });
      qc.invalidateQueries({ queryKey: ['page', page.id] });
    },
  });
}

/** Minimal landing info for a live invite link, from the server-authoritative
 * hook (GET /api/invite/{token}). The token is a secret — pages are NOT readable
 * by token via collection rules — so this route is the only pre-join peek.
 * Returns null when the link is stale/revoked. */
export function useInvitedPage(token: string | undefined) {
  return useQuery({
    queryKey: ['invite', token],
    enabled: !!token,
    queryFn: () =>
      pb
        .send<InvitePreview>(`/api/invite/${encodeURIComponent(token as string)}`, {
          method: 'GET',
        })
        .catch(() => null),
  });
}

/** Join a page via its invite (POST /api/join/{token}). The server sets the
 * role from the page's inviteRole — never trusted from the client — and the
 * call is idempotent. Returns the joined page id. */
export function useJoinPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) =>
      pb.send<{ pageId: string; role: ShareRole }>(`/api/join/${encodeURIComponent(token)}`, {
        method: 'POST',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'], exact: false }),
  });
}
