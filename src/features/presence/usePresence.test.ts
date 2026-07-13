import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const { api, sub, unsub, store } = vi.hoisted(() => ({
  api: { fetchPresence: vi.fn(), heartbeat: vi.fn(), clearPresence: vi.fn() },
  sub: vi.fn(),
  unsub: vi.fn(),
  store: { record: { id: 'me' }, isValid: true },
}));
vi.mock('./presenceApi', () => api);
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => ({ subscribe: sub }), authStore: store },
  isSignedIn: () => store.isValid,
}));

import { usePresence } from './usePresence';

beforeEach(() => {
  vi.clearAllMocks();
  store.isValid = true;
  api.heartbeat.mockResolvedValue(undefined);
  api.clearPresence.mockResolvedValue(undefined);
  api.fetchPresence.mockResolvedValue([]);
  sub.mockResolvedValue(unsub);
});

describe('usePresence', () => {
  it('sends a heartbeat and subscribes on mount', async () => {
    renderHook(() => usePresence('pg'));
    await waitFor(() => expect(api.heartbeat).toHaveBeenCalledWith('pg'));
    expect(sub).toHaveBeenCalledWith('*', expect.any(Function));
  });

  it('does nothing without a page id', () => {
    renderHook(() => usePresence(undefined));
    expect(api.heartbeat).not.toHaveBeenCalled();
    expect(sub).not.toHaveBeenCalled();
  });

  it('does nothing when signed out', () => {
    store.isValid = false;
    renderHook(() => usePresence('pg'));
    expect(api.heartbeat).not.toHaveBeenCalled();
  });

  it('returns the active viewers from fetched rows (excluding self)', async () => {
    const now = new Date().toISOString();
    api.fetchPresence.mockResolvedValue([
      { id: 'r1', page: 'pg', user: 'other', updated: now, expand: { user: { name: 'Ada' } } },
      { id: 'r2', page: 'pg', user: 'me', updated: now },
    ]);
    const { result } = renderHook(() => usePresence('pg'));
    await waitFor(() => expect(result.current).toHaveLength(1));
    expect(result.current[0].label).toBe('Ada');
  });

  it('clears presence and unsubscribes on unmount', async () => {
    const { unmount } = renderHook(() => usePresence('pg'));
    await waitFor(() => expect(sub).toHaveBeenCalled());
    unmount();
    await waitFor(() => expect(unsub).toHaveBeenCalled());
    expect(api.clearPresence).toHaveBeenCalledWith('pg');
  });
});
