import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const blocks = { create: vi.fn(), update: vi.fn() };
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => blocks },
  currentUserId: () => 'u1',
}));

import { useDuplicateMany } from './duplicateManyApi';
import type { BlockRecord } from '../../lib/pbClient';

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

const b = (id: string, sort: number, over: Partial<BlockRecord> = {}): BlockRecord =>
  ({
    id,
    sort,
    page: 'p1',
    type: 'text',
    content: id,
    checked: false,
    owner: 'u1',
    ...over,
  }) as BlockRecord;

describe('useDuplicateMany', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clones the selection as a run directly below the last selected block', async () => {
    const list = [b('a', 0), b('b', 1, { depth: 1, color: 'blue' }), b('c', 2), b('d', 3)];
    // Two clones created in order, then re-sorted.
    blocks.create
      .mockResolvedValueOnce(b('cb', 4, { content: 'b' }))
      .mockResolvedValueOnce(b('cc', 5, { content: 'c' }));
    blocks.update.mockResolvedValue({});
    const { result } = renderHook(() => useDuplicateMany('p1'), { wrapper });
    await result.current.mutateAsync({ sources: [list[1], list[2]], blocks: list });

    // The 'b' clone preserves depth + color (full clone, not just content).
    expect(blocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ page: 'p1', content: 'b', depth: 1, color: 'blue', owner: 'u1' }),
    );
    // Desired order a,b,c,cb,cc,d → clones land at sorts 3 and 4 (after 'c', the last selected).
    expect(blocks.update).toHaveBeenCalledWith('cb', { sort: 3 });
    expect(blocks.update).toHaveBeenCalledWith('cc', { sort: 4 });
  });

  it('does nothing when the selection is empty', async () => {
    const { result } = renderHook(() => useDuplicateMany('p1'), { wrapper });
    await result.current.mutateAsync({ sources: [], blocks: [b('a', 0)] });
    expect(blocks.create).not.toHaveBeenCalled();
  });
});
