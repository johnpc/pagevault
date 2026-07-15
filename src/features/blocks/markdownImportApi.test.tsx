import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

const blocks = { create: vi.fn(), delete: vi.fn(), update: vi.fn() };
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => blocks },
  currentUserId: () => 'u1',
}));

import { useImportMarkdown } from './markdownImportApi';

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
    checked: false,
    owner: 'u1',
  }) as unknown as BlockRecord;

describe('useImportMarkdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes the target block and creates one block per parsed entry', async () => {
    blocks.delete.mockResolvedValue(true);
    blocks.create.mockResolvedValue({ id: 'new' });
    blocks.update.mockResolvedValue(true);
    const target = blk('t', 0);
    const { result } = renderHook(() => useImportMarkdown('p1'), { wrapper });
    await result.current.mutateAsync({
      target,
      blocks: [target],
      parsed: [
        { type: 'heading', content: 'Title' },
        { type: 'bullet', content: 'one' },
      ],
    });
    expect(blocks.delete).toHaveBeenCalledWith('t');
    expect(blocks.create).toHaveBeenCalledTimes(2);
    expect(blocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ page: 'p1', type: 'heading', content: 'Title', owner: 'u1' }),
    );
  });

  it('drops the created blocks into the target block’s slot (not the page end)', async () => {
    blocks.delete.mockResolvedValue(true);
    // Two created blocks come back with far-end provisional sorts.
    blocks.create.mockResolvedValueOnce(blk('n1', 3)).mockResolvedValueOnce(blk('n2', 4));
    blocks.update.mockResolvedValue(true);
    // Page: a(0), target(1), c(2). Paste 2 blocks into the target → a,n1,n2,c.
    const a = blk('a', 0);
    const target = blk('t', 1);
    const c = blk('c', 2);
    const { result } = renderHook(() => useImportMarkdown('p1'), { wrapper });
    await result.current.mutateAsync({
      target,
      blocks: [a, target, c],
      parsed: [
        { type: 'text', content: 'x' },
        { type: 'text', content: 'y' },
      ],
    });
    // Desired order a,n1,n2,c → n1→1, n2→2, c→3 (a stays at 0).
    expect(blocks.update).toHaveBeenCalledWith('n1', { sort: 1 });
    expect(blocks.update).toHaveBeenCalledWith('n2', { sort: 2 });
    expect(blocks.update).toHaveBeenCalledWith('c', { sort: 3 });
  });
});
