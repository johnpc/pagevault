import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const blocks = {
  getFullList: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => blocks },
  currentUserId: () => 'u1',
}));

import { useBlocks, useCreateBlock, useUpdateBlock, useDeleteBlock } from './blocksApi';

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('blocksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useBlocks filters by page and sorts', async () => {
    blocks.getFullList.mockResolvedValue([{ id: 'b1' }]);
    const { result } = renderHook(() => useBlocks('p1'), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(blocks.getFullList).toHaveBeenCalledWith({ filter: "page = 'p1'", sort: 'sort' });
  });

  it('useBlocks is disabled without a page id', () => {
    const { result } = renderHook(() => useBlocks(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('useCreateBlock stamps page, owner and next sort', async () => {
    blocks.create.mockResolvedValue({ id: 'b2' });
    const { result } = renderHook(() => useCreateBlock('p1'), { wrapper });
    await result.current.mutateAsync({
      type: 'text',
      content: 'hi',
      siblings: [{ sort: 0 }] as never,
    });
    expect(blocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ page: 'p1', owner: 'u1', sort: 1, type: 'text', content: 'hi' }),
    );
  });

  it('useUpdateBlock patches and useDeleteBlock removes', async () => {
    blocks.update.mockResolvedValue({ id: 'b1' });
    blocks.delete.mockResolvedValue(true);
    const upd = renderHook(() => useUpdateBlock('p1'), { wrapper });
    await upd.result.current.mutateAsync({ id: 'b1', patch: { checked: true } });
    expect(blocks.update).toHaveBeenCalledWith('b1', { checked: true });
    const del = renderHook(() => useDeleteBlock('p1'), { wrapper });
    await del.result.current.mutateAsync('b1');
    expect(blocks.delete).toHaveBeenCalledWith('b1');
  });
});
