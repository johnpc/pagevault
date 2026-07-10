import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const pages = { getFullList: vi.fn(), getOne: vi.fn() };
const blocks = { getFullList: vi.fn() };
const cols: Record<string, unknown> = { pages, blocks };
vi.mock('../../lib/pbClient', () => ({ pb: { collection: (n: string) => cols[n] } }));

import { useSearch } from './searchApi';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is disabled for an empty query', () => {
    const { result } = renderHook(() => useSearch('  '), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('merges page-title and block-content hits, loading missing pages', async () => {
    pages.getFullList.mockResolvedValue([
      { id: 'p1', title: 'Roadmap', icon: '🚀', archived: false },
    ]);
    blocks.getFullList.mockResolvedValue([{ id: 'b1', page: 'p2', content: 'the roadmap plan' }]);
    pages.getOne.mockResolvedValue({ id: 'p2', title: 'Notes', icon: '📄', archived: false });

    const { result } = renderHook(() => useSearch('roadmap'), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.data?.[0]).toMatchObject({ pageId: 'p1', kind: 'title' });
    expect(result.current.data?.[1]).toMatchObject({ pageId: 'p2', kind: 'block' });
    // The missing page (p2, referenced by a block) was fetched.
    expect(pages.getOne).toHaveBeenCalledWith('p2');
  });

  it('escapes quotes in the query filter', async () => {
    pages.getFullList.mockResolvedValue([]);
    blocks.getFullList.mockResolvedValue([]);
    const { result } = renderHook(() => useSearch('say "hi"'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(pages.getFullList).toHaveBeenCalledWith(
      expect.objectContaining({ filter: expect.stringContaining('\\"hi\\"') }),
    );
  });
});
