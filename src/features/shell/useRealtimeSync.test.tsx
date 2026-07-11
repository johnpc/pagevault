import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

type Handler = (e: { record: { id: string; page?: string } }) => void;
const handlers: Record<string, Handler> = {};
const unsub = vi.fn();
const subscribe = vi.fn((_topic: string, _cb: Handler) => Promise.resolve(unsub));
let signedIn = true;

vi.mock('../../lib/pbClient', () => ({
  pb: {
    collection: (name: string) => ({
      subscribe: (topic: string, cb: Handler) => {
        handlers[name] = cb;
        return subscribe(topic, cb);
      },
    }),
  },
  isSignedIn: () => signedIn,
}));

import { useRealtimeSync } from './useRealtimeSync';

let qc: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

describe('useRealtimeSync', () => {
  beforeEach(() => {
    signedIn = true;
    subscribe.mockClear();
    unsub.mockClear();
    qc = new QueryClient();
  });

  it('subscribes to pages and blocks when signed in', () => {
    renderHook(() => useRealtimeSync(), { wrapper });
    expect(subscribe).toHaveBeenCalledTimes(2);
  });

  it('does not subscribe when signed out', () => {
    signedIn = false;
    renderHook(() => useRealtimeSync(), { wrapper });
    expect(subscribe).not.toHaveBeenCalled();
  });

  it('invalidates the page + pages keys on a pages event', () => {
    const spy = vi.spyOn(qc, 'invalidateQueries');
    renderHook(() => useRealtimeSync(), { wrapper });
    handlers.pages({ record: { id: 'p1' } });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['pages'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['page', 'p1'] });
  });

  it('invalidates the blocks key for the changed page on a blocks event', () => {
    const spy = vi.spyOn(qc, 'invalidateQueries');
    renderHook(() => useRealtimeSync(), { wrapper });
    handlers.blocks({ record: { id: 'b1', page: 'p9' } });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['blocks', 'p9'] });
  });

  it('unsubscribes on unmount', async () => {
    const { unmount } = renderHook(() => useRealtimeSync(), { wrapper });
    // The subscribe() promises must resolve before the cleanup can call their
    // unsub fns — wait for that rather than a fixed number of microticks.
    await waitFor(() => expect(subscribe).toHaveBeenCalledTimes(2));
    unmount();
    await waitFor(() => expect(unsub).toHaveBeenCalledTimes(2));
  });
});
