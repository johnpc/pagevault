import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

const blocks = { update: vi.fn() };
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => blocks },
  currentUserId: () => 'u1',
}));

import { useMoveBlock } from './useMoveBlock';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

const mk = (id: string, sort: number): BlockRecord =>
  ({ id, page: 'p1', type: 'text', content: id, sort, owner: 'u1' }) as unknown as BlockRecord;

describe('useMoveBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blocks.update.mockResolvedValue(true);
  });

  it('persists the new sort for blocks whose position changed', async () => {
    const ref = { current: [mk('a', 0), mk('b', 1), mk('c', 2)] };
    const { result } = renderHook(() => useMoveBlock('p1', ref), { wrapper });
    result.current('c', 'a'); // move c to a's position → order c, a, b
    await waitFor(() => expect(blocks.update).toHaveBeenCalled());
    // Every persisted update carries a numeric sort; c is now first.
    const calls = blocks.update.mock.calls.map(([id, patch]) => [id, patch.sort]);
    expect(calls).toContainEqual(['c', 0]);
  });

  it('does not persist when the move is a no-op (same position)', async () => {
    const ref = { current: [mk('a', 0), mk('b', 1)] };
    const { result } = renderHook(() => useMoveBlock('p1', ref), { wrapper });
    result.current('a', 'a');
    await new Promise((r) => setTimeout(r, 0));
    expect(blocks.update).not.toHaveBeenCalled();
  });

  it('keeps a stable handler identity across ref content changes', () => {
    const ref = { current: [mk('a', 0)] };
    const { result, rerender } = renderHook(() => useMoveBlock('p1', ref), { wrapper });
    const before = result.current;
    ref.current = [mk('a', 0), mk('b', 1)];
    rerender();
    expect(result.current).toBe(before);
  });
});
