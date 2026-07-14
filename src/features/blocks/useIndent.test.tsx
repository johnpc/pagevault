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

import { useIndent } from './useIndent';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

const mk = (id: string, depth: number): BlockRecord =>
  ({
    id,
    page: 'p1',
    type: 'text',
    content: id,
    sort: 0,
    depth,
    owner: 'u1',
  }) as unknown as BlockRecord;

describe('useIndent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blocks.update.mockResolvedValue(true);
  });

  it('indents a block one level deeper via a depth update', async () => {
    const ref = { current: [mk('a', 0), mk('b', 0)] };
    const { result } = renderHook(() => useIndent('p1', ref), { wrapper });
    result.current.indentBlock('b', 'in');
    await waitFor(() => expect(blocks.update).toHaveBeenCalledWith('b', { depth: 1 }));
  });

  it('does nothing when the indent would be a no-op (first block in)', async () => {
    const ref = { current: [mk('a', 0), mk('b', 0)] };
    const { result } = renderHook(() => useIndent('p1', ref), { wrapper });
    result.current.indentBlock('a', 'in'); // first block can't indent
    await new Promise((r) => setTimeout(r, 0));
    expect(blocks.update).not.toHaveBeenCalled();
  });

  it('keeps handler identity stable when the blocks ref content changes', () => {
    const ref = { current: [mk('a', 0)] };
    const { result, rerender } = renderHook(() => useIndent('p1', ref), { wrapper });
    const before = result.current.indentBlock;
    ref.current = [mk('a', 0), mk('b', 0)]; // ref object is stable; content updated
    rerender();
    expect(result.current.indentBlock).toBe(before);
  });
});
