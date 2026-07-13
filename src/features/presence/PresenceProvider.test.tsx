import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useContext } from 'react';

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

import { PresenceProvider } from './PresenceProvider';
import { PresenceContext, type PresenceState } from './PresenceContext';

let captured: PresenceState;
const Probe = () => {
  captured = useContext(PresenceContext);
  return (
    <>
      <span data-testid="viewers">{captured.viewers.length}</span>
      <span data-testid="cursor-b1">{(captured.cursors.b1 ?? []).length}</span>
    </>
  );
};

const now = new Date().toISOString();
beforeEach(() => {
  vi.clearAllMocks();
  store.isValid = true;
  api.heartbeat.mockResolvedValue(undefined);
  api.clearPresence.mockResolvedValue(undefined);
  api.fetchPresence.mockResolvedValue([]);
  sub.mockResolvedValue(unsub);
});

describe('PresenceProvider', () => {
  it('heartbeats and subscribes on mount', async () => {
    render(
      <PresenceProvider pageId="pg">
        <Probe />
      </PresenceProvider>,
    );
    await waitFor(() => expect(api.heartbeat).toHaveBeenCalledWith('pg', ''));
    expect(sub).toHaveBeenCalledWith('*', expect.any(Function));
  });

  it('exposes other viewers and their block cursors (excluding self)', async () => {
    api.fetchPresence.mockResolvedValue([
      {
        id: 'r1',
        page: 'pg',
        user: 'ada',
        block: 'b1',
        updated: now,
        expand: { user: { name: 'Ada' } },
      },
      { id: 'r2', page: 'pg', user: 'me', block: 'b1', updated: now },
    ]);
    render(
      <PresenceProvider pageId="pg">
        <Probe />
      </PresenceProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('viewers')).toHaveTextContent('1'));
    expect(screen.getByTestId('cursor-b1')).toHaveTextContent('1');
  });

  it('setFocusedBlock beats with the new block id', async () => {
    render(
      <PresenceProvider pageId="pg">
        <Probe />
      </PresenceProvider>,
    );
    await waitFor(() => expect(api.heartbeat).toHaveBeenCalled());
    api.heartbeat.mockClear();
    act(() => captured.setFocusedBlock('b9'));
    await waitFor(() => expect(api.heartbeat).toHaveBeenCalledWith('pg', 'b9'));
  });

  it('clears presence and unsubscribes on unmount', async () => {
    const { unmount } = render(
      <PresenceProvider pageId="pg">
        <Probe />
      </PresenceProvider>,
    );
    await waitFor(() => expect(sub).toHaveBeenCalled());
    unmount();
    await waitFor(() => expect(unsub).toHaveBeenCalled());
    expect(api.clearPresence).toHaveBeenCalledWith('pg');
  });
});
