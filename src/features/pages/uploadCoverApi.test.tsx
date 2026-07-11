import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const pages = { update: vi.fn() };
vi.mock('../../lib/pbClient', () => ({ pb: { collection: () => pages } }));

import { useUploadCover } from './uploadCoverApi';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useUploadCover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends the cover file as form data and clears the gradient', async () => {
    pages.update.mockResolvedValue({ id: 'p1' });
    const { result } = renderHook(() => useUploadCover(), { wrapper });
    const file = new File(['x'], 'banner.png', { type: 'image/png' });
    await result.current.mutateAsync({ id: 'p1', file });
    const [id, body] = pages.update.mock.calls[0];
    expect(id).toBe('p1');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('coverImage')).toBe(file);
    expect((body as FormData).get('cover')).toBe('');
  });
});
