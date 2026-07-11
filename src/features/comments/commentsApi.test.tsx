import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const comments = { getFullList: vi.fn(), create: vi.fn(), delete: vi.fn() };
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => comments },
  currentUserId: () => 'u1',
}));

import { useComments, useAddComment, useDeleteComment } from './commentsApi';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('commentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useComments filters by page and sorts by created', async () => {
    comments.getFullList.mockResolvedValue([{ id: 'c1' }]);
    const { result } = renderHook(() => useComments('p1'), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(comments.getFullList).toHaveBeenCalledWith({ filter: "page = 'p1'", sort: 'created' });
  });

  it('useComments is disabled without a page id', () => {
    const { result } = renderHook(() => useComments(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('useAddComment stamps page + owner', async () => {
    comments.create.mockResolvedValue({ id: 'c2' });
    const { result } = renderHook(() => useAddComment('p1'), { wrapper });
    await result.current.mutateAsync('hello');
    expect(comments.create).toHaveBeenCalledWith({ page: 'p1', body: 'hello', owner: 'u1' });
  });

  it('useDeleteComment removes by id', async () => {
    comments.delete.mockResolvedValue(true);
    const { result } = renderHook(() => useDeleteComment('p1'), { wrapper });
    await result.current.mutateAsync('c1');
    expect(comments.delete).toHaveBeenCalledWith('c1');
  });
});
