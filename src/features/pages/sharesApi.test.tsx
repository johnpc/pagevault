import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { PageRecord } from '../../lib/pbClient';

const { pages, send } = vi.hoisted(() => ({ pages: { update: vi.fn() }, send: vi.fn() }));
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: (n: string) => ({ pages })[n], send },
}));

import { useSetInvite, useRevokeInvite, useInvitedPage, useJoinPage } from './sharesApi';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const mk = (over: Partial<PageRecord> = {}): PageRecord =>
  ({ id: 'p1', title: 'T', inviteToken: '', inviteRole: '', owner: 'u1', ...over }) as PageRecord;

describe('useSetInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates an invite token when none exists and stores the role', async () => {
    pages.update.mockResolvedValue(mk({ inviteToken: 'x', inviteRole: 'edit' }));
    const { result } = renderHook(() => useSetInvite(), { wrapper });
    result.current.mutate({ page: mk(), role: 'edit' });
    await waitFor(() => expect(pages.update).toHaveBeenCalled());
    const [id, patch] = pages.update.mock.calls[0];
    expect(id).toBe('p1');
    expect(patch.inviteRole).toBe('edit');
    expect(patch.inviteToken).toHaveLength(16);
  });

  it('keeps an existing token, only changing the role', async () => {
    pages.update.mockResolvedValue(mk({ inviteToken: 'keep', inviteRole: 'view' }));
    const { result } = renderHook(() => useSetInvite(), { wrapper });
    result.current.mutate({ page: mk({ inviteToken: 'keep', inviteRole: 'edit' }), role: 'view' });
    await waitFor(() => expect(pages.update).toHaveBeenCalled());
    expect(pages.update.mock.calls[0][1]).toEqual({ inviteToken: 'keep', inviteRole: 'view' });
  });
});

describe('useRevokeInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('clears the token and role', async () => {
    pages.update.mockResolvedValue(mk());
    const { result } = renderHook(() => useRevokeInvite(), { wrapper });
    result.current.mutate(mk({ inviteToken: 'x', inviteRole: 'edit' }));
    await waitFor(() => expect(pages.update).toHaveBeenCalled());
    expect(pages.update.mock.calls[0][1]).toEqual({ inviteToken: '', inviteRole: '' });
  });
});

describe('useInvitedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('fetches the invite preview from the server hook by token', async () => {
    send.mockResolvedValue({ pageId: 'pg', title: 'T', icon: '', role: 'comment' });
    const { result } = renderHook(() => useInvitedPage('tok'), { wrapper });
    await waitFor(() => expect(result.current.data?.role).toBe('comment'));
    expect(send).toHaveBeenCalledWith('/api/invite/tok', { method: 'GET' });
  });

  it('returns null for a stale/revoked token', async () => {
    send.mockRejectedValue(new Error('404'));
    const { result } = renderHook(() => useInvitedPage('gone'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe('useJoinPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('joins via the server hook with the token (role set server-side)', async () => {
    send.mockResolvedValue({ pageId: 'pg', role: 'edit' });
    const { result } = renderHook(() => useJoinPage(), { wrapper });
    result.current.mutate('tok');
    await waitFor(() => expect(send).toHaveBeenCalled());
    expect(send).toHaveBeenCalledWith('/api/join/tok', { method: 'POST' });
  });
});
