import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const send = vi.fn();
vi.mock('../../lib/pbClient', () => ({ pb: { send: (...a: unknown[]) => send(...a) } }));

import { useLinkPreview } from './linkPreviewApi';

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useLinkPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is disabled (never fetches) without a url', () => {
    renderHook(() => useLinkPreview(undefined), { wrapper });
    expect(send).not.toHaveBeenCalled();
  });

  it('fetches and returns the preview payload for a url', async () => {
    const preview = { title: 'T', description: 'D', image: '', favicon: '', url: 'https://x.dev' };
    send.mockReturnValue(Promise.resolve(preview));
    const { result } = renderHook(() => useLinkPreview('https://x.dev'), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(preview));
    expect(send).toHaveBeenCalledWith('/api/link-preview?url=https%3A%2F%2Fx.dev', {
      method: 'GET',
    });
  });

  it('resolves to null when the fetch fails (graceful fallback)', async () => {
    send.mockReturnValue(Promise.reject(new Error('boom')));
    const { result } = renderHook(() => useLinkPreview('https://x.dev'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});
