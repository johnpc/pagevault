import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

const blocks = { update: vi.fn(), delete: vi.fn() };
vi.mock('../../lib/pbClient', () => ({ pb: { collection: () => blocks } }));

import { useMergeBlock } from './mergeBlockApi';

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  qc.setQueryData(['blocks', 'p1'], [
    { id: 'a', content: 'Hello' },
    { id: 'b', content: 'World' },
  ] as BlockRecord[]);
  return { qc, ui: <QueryClientProvider client={qc}>{children}</QueryClientProvider> };
};

describe('useMergeBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blocks.update.mockResolvedValue({});
    blocks.delete.mockResolvedValue(true);
  });

  it('updates the previous block with merged content and deletes the source', async () => {
    const w = wrapper({ children: null });
    const { result } = renderHook(() => useMergeBlock('p1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={w.qc}>{children}</QueryClientProvider>
      ),
    });
    await result.current.mutateAsync({ keepId: 'a', removeId: 'b', content: 'HelloWorld' });
    expect(blocks.update).toHaveBeenCalledWith('a', { content: 'HelloWorld' });
    expect(blocks.delete).toHaveBeenCalledWith('b');
  });

  it('optimistically merges the cache (prev updated, source removed)', async () => {
    const w = wrapper({ children: null });
    const { result } = renderHook(() => useMergeBlock('p1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={w.qc}>{children}</QueryClientProvider>
      ),
    });
    result.current.mutate({ keepId: 'a', removeId: 'b', content: 'HelloWorld' });
    await waitFor(() => {
      const cache = w.qc.getQueryData<BlockRecord[]>(['blocks', 'p1'])!;
      expect(cache).toHaveLength(1);
      expect(cache[0].content).toBe('HelloWorld');
    });
  });

  it('rolls the cache back on error', async () => {
    blocks.update.mockRejectedValue(new Error('nope'));
    const w = wrapper({ children: null });
    const { result } = renderHook(() => useMergeBlock('p1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={w.qc}>{children}</QueryClientProvider>
      ),
    });
    result.current.mutate({ keepId: 'a', removeId: 'b', content: 'HelloWorld' });
    await waitFor(() => expect(result.current.isError).toBe(true));
    const cache = w.qc.getQueryData<BlockRecord[]>(['blocks', 'p1'])!;
    expect(cache).toHaveLength(2);
  });
});
