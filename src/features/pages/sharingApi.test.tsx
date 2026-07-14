import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { PageRecord } from '../../lib/pbClient';

const pages = { update: vi.fn(), getFirstListItem: vi.fn() };
const blocks = { getFullList: vi.fn() };
const cols: Record<string, unknown> = { pages, blocks };
vi.mock('../../lib/pbClient', () => ({ pb: { collection: (n: string) => cols[n] } }));

import { useSetShared, usePublicPage, usePublicBlocks } from './sharingApi';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const mk = (over: Partial<PageRecord> = {}): PageRecord =>
  ({ id: 'p1', title: 'T', isPublic: false, shareToken: '', owner: 'u1', ...over }) as PageRecord;

describe('useSetShared', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates a share token when enabling and none exists', async () => {
    pages.update.mockResolvedValue(mk({ isPublic: true }));
    const { result } = renderHook(() => useSetShared(), { wrapper });
    await result.current.mutateAsync({ page: mk(), isPublic: true });
    const [id, patch] = pages.update.mock.calls[0];
    expect(id).toBe('p1');
    expect(patch.isPublic).toBe(true);
    expect(patch.shareToken).toHaveLength(16);
  });

  it('preserves an existing token when disabling (so re-sharing reuses the link)', async () => {
    pages.update.mockResolvedValue(mk());
    const { result } = renderHook(() => useSetShared(), { wrapper });
    await result.current.mutateAsync({ page: mk({ shareToken: 'keep' }), isPublic: false });
    expect(pages.update).toHaveBeenCalledWith('p1', { isPublic: false, shareToken: 'keep' });
  });
});

describe('usePublicPage / usePublicBlocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches a public page by token', async () => {
    pages.getFirstListItem.mockResolvedValue(mk({ id: 'p9' }));
    const { result } = renderHook(() => usePublicPage('tok'), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe('p9'));
    expect(pages.getFirstListItem).toHaveBeenCalledWith('shareToken = "tok" && isPublic = true');
  });

  it('resolves an unknown/revoked token to null (404 is not an error)', async () => {
    pages.getFirstListItem.mockRejectedValue({ status: 404 });
    const { result } = renderHook(() => usePublicPage('gone'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it('still surfaces a real network error (non-404)', async () => {
    pages.getFirstListItem.mockRejectedValue({ status: 500 });
    const { result } = renderHook(() => usePublicPage('boom'), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('fetches public blocks for a page id', async () => {
    blocks.getFullList.mockResolvedValue([{ id: 'b1' }]);
    const { result } = renderHook(() => usePublicBlocks('p9'), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(blocks.getFullList).toHaveBeenCalledWith({ filter: "page = 'p9'", sort: 'sort' });
  });
});
