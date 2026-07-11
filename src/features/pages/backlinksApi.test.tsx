import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const blocks = { getFullList: vi.fn() };
const pages = { getOne: vi.fn() };
const cols: Record<string, unknown> = { blocks, pages };
vi.mock('../../lib/pbClient', () => ({ pb: { collection: (n: string) => cols[n] } }));

import { useBacklinks } from './backlinksApi';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useBacklinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is disabled without a page id', () => {
    const { result } = renderHook(() => useBacklinks(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('queries blocks by the mention marker and groups them by source page', async () => {
    blocks.getFullList.mockResolvedValue([
      { id: 'b1', page: 'src1', content: '@[Roadmap](target)' },
      { id: 'b2', page: 'target', content: 'self @[Roadmap](target)' },
    ]);
    pages.getOne.mockResolvedValue({ id: 'src1', title: 'Journal', archived: false });
    const { result } = renderHook(() => useBacklinks('target'), { wrapper });
    await waitFor(() => expect(result.current.data).toBeDefined());
    // The filter targets the ](target) marker.
    expect(blocks.getFullList).toHaveBeenCalledWith({ filter: 'content ~ "](target)"' });
    // Only the non-self source page is a backlink.
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].page.id).toBe('src1');
  });
});
