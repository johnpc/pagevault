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

import { useBlocks, useCreateBlock, useDeleteBlock, useDuplicateBlock } from './blocksApi';
import { useUpdateBlock } from './updateBlockApi';
import { useUploadBlockFile } from './uploadBlockFileApi';
import type { BlockRecord } from '../../lib/pbClient';

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

  it('useUploadBlockFile sends the file as form data and clears the URL', async () => {
    blocks.update.mockResolvedValue({ id: 'b1', file: 'pic.png' });
    const { result } = renderHook(() => useUploadBlockFile('p1'), { wrapper });
    const file = new File(['x'], 'pic.png', { type: 'image/png' });
    await result.current.mutateAsync({ id: 'b1', file });
    const [id, body] = blocks.update.mock.calls[0];
    expect(id).toBe('b1');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
    expect((body as FormData).get('content')).toBe('');
  });

  it('useDuplicateBlock clones a block and inserts it below the source', async () => {
    const b = (id: string, sort: number, over: Partial<BlockRecord> = {}): BlockRecord =>
      ({
        id,
        sort,
        page: 'p1',
        type: 'text',
        content: id,
        checked: false,
        owner: 'u1',
        created: '',
        updated: '',
        collectionId: 'c',
        collectionName: 'blocks',
        ...over,
      }) as BlockRecord;
    const list = [b('a', 0), b('b', 1), b('c', 2)];
    blocks.create.mockResolvedValue(b('new', 3, { content: 'a' }));
    blocks.update.mockResolvedValue({});
    const { result } = renderHook(() => useDuplicateBlock('p1'), { wrapper });
    await result.current.mutateAsync({ source: list[0], blocks: list });
    // The clone copies the source's content and is created for this page.
    expect(blocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ page: 'p1', content: 'a', owner: 'u1' }),
    );
    // Desired order a,new,b,c → the clone must land at sort 1 (right after a).
    expect(blocks.update).toHaveBeenCalledWith('new', { sort: 1 });
  });
});
