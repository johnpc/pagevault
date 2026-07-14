import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

const blocks = { update: vi.fn(), delete: vi.fn() };
vi.mock('../../lib/pbClient', () => ({ pb: { collection: () => blocks } }));

import { useBackspaceMerge } from './useBackspaceMerge';

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

const mk = (id: string, type: string, content: string): BlockRecord =>
  ({ id, type, content }) as unknown as BlockRecord;

describe('useBackspaceMerge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blocks.update.mockResolvedValue({});
    blocks.delete.mockResolvedValue(true);
  });

  it('merges into the previous block and focuses it at the join', () => {
    const focusAt = vi.fn();
    const list = [mk('a', 'text', 'Hello'), mk('b', 'text', 'stale')];
    const { result } = renderHook(() => useBackspaceMerge('p1', list, { focusAt }), { wrapper });
    // Pass the LIVE value ("World") — not the stale cached "stale".
    const merged = result.current('b', 'World');
    expect(merged).toBe(true);
    expect(focusAt).toHaveBeenCalledWith('a', 5, 'HelloWorld');
  });

  it('returns false and does nothing at the first block', () => {
    const focusAt = vi.fn();
    const list = [mk('a', 'text', 'Hello')];
    const { result } = renderHook(() => useBackspaceMerge('p1', list, { focusAt }), { wrapper });
    expect(result.current('a', 'Hello')).toBe(false);
    expect(focusAt).not.toHaveBeenCalled();
  });

  it('returns false when the previous block is not mergeable', () => {
    const focusAt = vi.fn();
    const list = [mk('a', 'divider', ''), mk('b', 'text', 'World')];
    const { result } = renderHook(() => useBackspaceMerge('p1', list, { focusAt }), { wrapper });
    expect(result.current('b', 'World')).toBe(false);
    expect(focusAt).not.toHaveBeenCalled();
  });
});
