import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const blocks = { create: vi.fn(), update: vi.fn() };
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => blocks },
  currentUserId: () => 'u1',
}));

import { useInsertBlockAfter } from './insertBlockApi';
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

describe('useInsertBlockAfter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an empty text block and lands it right below the source', async () => {
    const list = [b('a', 0, { depth: 2 }), b('b', 1), b('c', 2)];
    blocks.create.mockResolvedValue(b('new', 3, { content: '' }));
    blocks.update.mockResolvedValue({});
    const { result } = renderHook(() => useInsertBlockAfter('p1'), { wrapper });
    const created = await result.current.mutateAsync({ source: list[0], blocks: list });
    // A fresh empty text block at the source's depth, owned by the current user.
    expect(blocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ page: 'p1', type: 'text', content: '', depth: 2, owner: 'u1' }),
    );
    // Desired order a,new,b,c → the new block must sort to 1 (right after a).
    expect(blocks.update).toHaveBeenCalledWith('new', { sort: 1 });
    expect(created.id).toBe('new');
  });
});
