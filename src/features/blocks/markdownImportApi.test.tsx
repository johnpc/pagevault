import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';

const blocks = { create: vi.fn(), delete: vi.fn() };
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
});
