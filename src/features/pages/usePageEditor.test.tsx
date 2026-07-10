import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const pages = { getOne: vi.fn(), update: vi.fn(), delete: vi.fn() };
const blocks = { getFullList: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() };
const cols: Record<string, unknown> = { pages, blocks };

vi.mock('../../lib/pbClient', () => ({
  pb: { collection: (n: string) => cols[n] },
  currentUserId: () => 'u1',
}));

import { usePageEditor } from './usePageEditor';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('usePageEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pages.getOne.mockResolvedValue({ id: 'p1', title: 'T' });
    blocks.getFullList.mockResolvedValue([
      { id: 'b1', sort: 0 },
      { id: 'b2', sort: 1 },
    ]);
    pages.update.mockResolvedValue({ id: 'p1' });
    pages.delete.mockResolvedValue(true);
    blocks.create.mockResolvedValue({ id: 'b2' });
    blocks.update.mockResolvedValue({ id: 'b1' });
    blocks.delete.mockResolvedValue(true);
  });

  it('exposes every editor action wired to the client', async () => {
    const { result } = renderHook(() => usePageEditor('p1'), { wrapper });
    await waitFor(() => expect(result.current.blocks.data).toHaveLength(2));

    act(() => result.current.moveBlockTo('b2', 'b1'));
    act(() => result.current.setTitle('New title'));
    act(() => result.current.setIcon('🚀'));
    act(() => result.current.addBlock('heading'));
    act(() => result.current.editBlock('b1', { content: 'x' }));
    act(() => result.current.removeBlock('b1'));
    await act(() => result.current.removePage('p1'));

    await waitFor(() => {
      expect(pages.update).toHaveBeenCalledWith('p1', { title: 'New title' });
      expect(pages.update).toHaveBeenCalledWith('p1', { icon: '🚀' });
    });
    expect(blocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'heading', sort: 2 }),
    );
    expect(blocks.update).toHaveBeenCalledWith('b1', { content: 'x' });
    expect(blocks.delete).toHaveBeenCalledWith('b1');
    expect(pages.delete).toHaveBeenCalledWith('p1');
    // moveBlockTo('b2','b1') swaps order → both blocks get a new sort.
    expect(blocks.update).toHaveBeenCalledWith('b2', { sort: 0 });
    expect(blocks.update).toHaveBeenCalledWith('b1', { sort: 1 });
  });
});
