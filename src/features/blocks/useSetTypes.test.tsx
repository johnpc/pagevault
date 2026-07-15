import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const blocks = { update: vi.fn() };
vi.mock('../../lib/pbClient', () => ({ pb: { collection: () => blocks } }));

import { useSetTypes } from './useSetTypes';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

describe('useSetTypes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    blocks.update.mockResolvedValue(true);
    qc.setQueryData(
      ['blocks', 'p1'],
      [
        { id: 'a', type: 'text' },
        { id: 'b', type: 'text' },
      ],
    );
  });

  it('typeMany converts every id and optimistically sets the cache', async () => {
    const { result } = renderHook(() => useSetTypes('p1'), { wrapper });
    result.current(['a', 'b'], 'heading');
    await waitFor(() => expect(blocks.update).toHaveBeenCalledTimes(2));
    expect(blocks.update).toHaveBeenCalledWith('a', { type: 'heading' });
    expect(blocks.update).toHaveBeenCalledWith('b', { type: 'heading' });
    const cached = qc.getQueryData(['blocks', 'p1']) as { id: string; type: string }[];
    expect(cached.every((b) => b.type === 'heading')).toBe(true);
  });
});
