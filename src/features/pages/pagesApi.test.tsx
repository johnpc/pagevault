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
const blocks = { create: vi.fn() };
const cols: Record<string, unknown> = { pages, blocks };

vi.mock('../../lib/pbClient', () => ({
  pb: { collection: (n: string) => cols[n] },
  currentUserId: () => 'u1',
}));

import {
  usePages,
  usePage,
  useCreatePage,
  useUpdatePage,
  useDeletePage,
  useArchivedPages,
  useArchivePage,
  useRestorePage,
  useToggleFavorite,
  useDuplicatePage,
} from './pagesApi';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';

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

  it('useArchivedPages lists archived pages newest-first', async () => {
    pages.getFullList.mockResolvedValue([{ id: 'p1' }]);
    const { result } = renderHook(() => useArchivedPages(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(pages.getFullList).toHaveBeenCalledWith({ filter: 'archived = true', sort: '-updated' });
  });

  it('useArchivePage soft-deletes (archived: true)', async () => {
    pages.update.mockResolvedValue({ id: 'p1' });
    const { result } = renderHook(() => useArchivePage(), { wrapper });
    await result.current.mutateAsync('p1');
    expect(pages.update).toHaveBeenCalledWith('p1', { archived: true });
  });

  it('useRestorePage un-archives (archived: false)', async () => {
    pages.update.mockResolvedValue({ id: 'p1' });
    const { result } = renderHook(() => useRestorePage(), { wrapper });
    await result.current.mutateAsync('p1');
    expect(pages.update).toHaveBeenCalledWith('p1', { archived: false });
  });

  it('useToggleFavorite sets the favorite flag', async () => {
    pages.update.mockResolvedValue({ id: 'p1' });
    const { result } = renderHook(() => useToggleFavorite(), { wrapper });
    await result.current.mutateAsync({ id: 'p1', favorite: true });
    expect(pages.update).toHaveBeenCalledWith('p1', { favorite: true });
  });

  it('useDuplicatePage creates a page copy plus cloned blocks', async () => {
    pages.create.mockResolvedValue({ id: 'copy1' });
    blocks.create.mockResolvedValue({ id: 'nb' });
    const source = {
      id: 'p1',
      title: 'Plan',
      icon: '🚀',
      parent: '',
      archived: false,
      favorite: false,
    } as PageRecord;
    const srcBlocks = [
      { id: 'b1', type: 'text', content: 'A', sort: 0, checked: false } as BlockRecord,
      { id: 'b2', type: 'todo', content: 'B', sort: 1, checked: true } as BlockRecord,
    ];
    const { result } = renderHook(() => useDuplicatePage(), { wrapper });
    const newId = await result.current.mutateAsync({ source, blocks: srcBlocks, siblings: [] });
    expect(newId).toBe('copy1');
    expect(pages.create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Plan (copy)' }));
    expect(blocks.create).toHaveBeenCalledTimes(2);
    expect(blocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ page: 'copy1', content: 'A' }),
    );
  });
});
