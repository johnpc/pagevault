import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

const blocks = { update: vi.fn(), delete: vi.fn() };
vi.mock('../../lib/pbClient', () => ({ pb: { collection: () => blocks } }));

import { useBlockMerge } from './useBlockMerge';

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

const mk = (id: string, type: string, content: string): BlockRecord =>
  ({ id, type, content }) as unknown as BlockRecord;

const list = [mk('a', 'text', 'Hello'), mk('b', 'text', 'World')];

describe('useBlockMerge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blocks.update.mockResolvedValue({});
    blocks.delete.mockResolvedValue(true);
  });

  it('mergeUp folds a block into the previous one, focusing it at the join', () => {
    const focusAt = vi.fn();
    const { result } = renderHook(() => useBlockMerge('p1', { current: list }, { focusAt }), {
      wrapper,
    });
    // Pass the LIVE value ("World") — not a stale cached one.
    expect(result.current.mergeUp('b', 'World')).toBe(true);
    expect(focusAt).toHaveBeenCalledWith('a', 5, 'HelloWorld');
  });

  it('mergeUp is a no-op at the first block', () => {
    const focusAt = vi.fn();
    const { result } = renderHook(() => useBlockMerge('p1', { current: list }, { focusAt }), {
      wrapper,
    });
    expect(result.current.mergeUp('a', 'Hello')).toBe(false);
    expect(focusAt).not.toHaveBeenCalled();
  });

  it('mergeDown pulls the next block up, keeping focus at the join', () => {
    const focusAt = vi.fn();
    const { result } = renderHook(() => useBlockMerge('p1', { current: list }, { focusAt }), {
      wrapper,
    });
    // Delete at the end of "Hello" (live value) pulls "World" up.
    expect(result.current.mergeDown('a', 'Hello')).toBe(true);
    expect(focusAt).toHaveBeenCalledWith('a', 5, 'HelloWorld');
  });

  it('mergeDown is a no-op at the last block', () => {
    const focusAt = vi.fn();
    const { result } = renderHook(() => useBlockMerge('p1', { current: list }, { focusAt }), {
      wrapper,
    });
    expect(result.current.mergeDown('b', 'World')).toBe(false);
    expect(focusAt).not.toHaveBeenCalled();
  });

  it('does not merge across a non-mergeable block (divider)', () => {
    const focusAt = vi.fn();
    const withDivider = [
      mk('a', 'text', 'Hello'),
      mk('d', 'divider', ''),
      mk('b', 'text', 'World'),
    ];
    const { result } = renderHook(
      () => useBlockMerge('p1', { current: withDivider }, { focusAt }),
      { wrapper },
    );
    expect(result.current.mergeUp('b', 'World')).toBe(false);
    expect(result.current.mergeDown('a', 'Hello')).toBe(false);
  });
});
