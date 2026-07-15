import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const blocks = { update: vi.fn() };
vi.mock('../../lib/pbClient', () => ({ pb: { collection: () => blocks } }));

import { useSetColors } from './useSetColors';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

describe('useSetColors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blocks.update.mockResolvedValue(true);
    qc.setQueryData(
      ['blocks', 'p1'],
      [
        { id: 'a', color: '' },
        { id: 'b', color: '' },
      ],
    );
  });

  it('colorMany updates every id and optimistically sets the cache', async () => {
    const { result } = renderHook(() => useSetColors('p1'), { wrapper });
    result.current(['a', 'b'], 'blue');
    await waitFor(() => expect(blocks.update).toHaveBeenCalledTimes(2));
    expect(blocks.update).toHaveBeenCalledWith('a', { color: 'blue' });
    expect(blocks.update).toHaveBeenCalledWith('b', { color: 'blue' });
    // The optimistic onMutate cache write (after its awaited cancelQueries).
    const cached = qc.getQueryData(['blocks', 'p1']) as { id: string; color: string }[];
    expect(cached.every((b) => b.color === 'blue')).toBe(true);
  });
});
