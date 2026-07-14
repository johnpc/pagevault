import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

const blocks = { create: vi.fn(), delete: vi.fn() };
const toasts: Array<{ message: string; action?: { label: string; run: () => void } }> = [];

vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => blocks },
  currentUserId: () => 'u1',
}));
vi.mock('../shell/toastBus', () => ({
  showToast: (message: string, action?: { label: string; run: () => void }) =>
    toasts.push({ message, action }),
}));

import { useDeleteWithUndo } from './useDeleteWithUndo';

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

const mk = (id: string, sort: number): BlockRecord =>
  ({ id, page: 'p1', type: 'text', content: id, sort, owner: 'u1' }) as unknown as BlockRecord;

const list = [mk('a', 0), mk('b', 1), mk('c', 2)];

describe('useDeleteWithUndo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toasts.length = 0;
    blocks.delete.mockResolvedValue(true);
    blocks.create.mockResolvedValue({ id: 'x' });
  });

  it('deletes a single block and offers a singular Undo toast', async () => {
    const { result } = renderHook(() => useDeleteWithUndo('p1', list), { wrapper });
    result.current('b');
    await waitFor(() => expect(toasts).toHaveLength(1));
    expect(blocks.delete).toHaveBeenCalledWith('b');
    expect(toasts[0].message).toBe('Block deleted.');
    expect(toasts[0].action?.label).toBe('Undo');
  });

  it('pluralizes the toast for a multi-block delete', async () => {
    const { result } = renderHook(() => useDeleteWithUndo('p1', list), { wrapper });
    result.current(['a', 'c']);
    await waitFor(() => expect(toasts).toHaveLength(1));
    expect(toasts[0].message).toBe('2 blocks deleted.');
  });

  it('restores the exact deleted blocks when Undo runs', async () => {
    const { result } = renderHook(() => useDeleteWithUndo('p1', list), { wrapper });
    result.current(['a', 'c']);
    await waitFor(() => expect(toasts).toHaveLength(1));
    toasts[0].action?.run();
    await waitFor(() => expect(blocks.create).toHaveBeenCalledTimes(2));
    expect(blocks.create).toHaveBeenCalledWith(expect.objectContaining({ id: 'a', sort: 0 }));
    expect(blocks.create).toHaveBeenCalledWith(expect.objectContaining({ id: 'c', sort: 2 }));
  });
});
