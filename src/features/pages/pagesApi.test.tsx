import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const pages = {
  getFullList: vi.fn(),
  getOne: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => pages },
  currentUserId: () => 'u1',
}));

import { usePages, usePage, useCreatePage, useUpdatePage, useDeletePage } from './pagesApi';

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('pagesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usePages lists non-archived pages', async () => {
    pages.getFullList.mockResolvedValue([{ id: 'p1', title: 'A' }]);
    const { result } = renderHook(() => usePages(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(pages.getFullList).toHaveBeenCalledWith({ filter: 'archived = false', sort: 'sort' });
  });

  it('usePage fetches one when enabled', async () => {
    pages.getOne.mockResolvedValue({ id: 'p1' });
    const { result } = renderHook(() => usePage('p1'), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe('p1'));
  });

  it('useCreatePage stamps owner and next sort', async () => {
    pages.create.mockResolvedValue({ id: 'p2' });
    const { result } = renderHook(() => useCreatePage(), { wrapper });
    await result.current.mutateAsync({ siblings: [{ sort: 2 }] as never });
    expect(pages.create).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'u1', sort: 3, title: '', parent: '' }),
    );
  });

  it('useUpdatePage patches by id', async () => {
    pages.update.mockResolvedValue({ id: 'p1' });
    const { result } = renderHook(() => useUpdatePage(), { wrapper });
    await result.current.mutateAsync({ id: 'p1', patch: { title: 'New' } });
    expect(pages.update).toHaveBeenCalledWith('p1', { title: 'New' });
  });

  it('useDeletePage removes by id', async () => {
    pages.delete.mockResolvedValue(true);
    const { result } = renderHook(() => useDeletePage(), { wrapper });
    await result.current.mutateAsync('p1');
    expect(pages.delete).toHaveBeenCalledWith('p1');
  });
});
