import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

const blocks = { create: vi.fn(), update: vi.fn() };
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => blocks },
  currentUserId: () => 'u1',
}));

import { useSplitBlock } from './splitBlockApi';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const blk = (id: string, sort: number): BlockRecord =>
  ({
    id,
    sort,
    page: 'p1',
    type: 'text',
    content: '',
    depth: 0,
    owner: 'u1',
  }) as unknown as BlockRecord;

describe('useSplitBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('trims the source to the pre-caret text and inserts the rest directly below', async () => {
    const source = blk('a', 0);
    const other = blk('b', 1);
    blocks.create.mockResolvedValue({ id: 'new', sort: 2 });
    blocks.update.mockResolvedValue(true);
    const { result } = renderHook(() => useSplitBlock('p1'), { wrapper });
    await result.current.mutateAsync({
      source,
      before: 'hel',
      after: 'lo',
      type: 'text',
      depth: 0,
      blocks: [source, other],
    });
    // Source trimmed to the pre-caret text.
    expect(blocks.update).toHaveBeenCalledWith('a', { content: 'hel' });
    // New block created with the post-caret text.
    expect(blocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ page: 'p1', type: 'text', content: 'lo', owner: 'u1' }),
    );
    // The new block is reordered to sit right after the source (sort 1), pushing
    // the previously-second block down.
    expect(blocks.update).toHaveBeenCalledWith('new', { sort: 1 });
    expect(blocks.update).toHaveBeenCalledWith('b', { sort: 2 });
  });
});
