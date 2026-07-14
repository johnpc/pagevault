import { describe, it, expect, vi, beforeEach } from 'vitest';

// The client reads import.meta.env at module load; mock the pocketbase default
// export so instantiating it doesn't hit the network.
vi.mock('pocketbase', () => ({
  default: class {
    authStore = { isValid: false, record: null as { id: string } | null };
    // The client disables auto-cancellation at load; the mock just accepts it.
    autoCancellation() {
      return this;
    }
  },
}));

import { pb, isSignedIn, currentUserId, PB_URL } from './pbClient';

// The store fields are readonly in PocketBase's types; the mock lets us set them
// for the test via a mutable view.
const store = pb.authStore as unknown as { isValid: boolean; record: { id: string } | null };

describe('pbClient', () => {
  beforeEach(() => {
    store.isValid = false;
    store.record = null;
  });

  it('defaults PB_URL to the local docker-compose instance', () => {
    expect(PB_URL).toBe('http://localhost:8090');
  });

  it('reports signed-out state', () => {
    expect(isSignedIn()).toBe(false);
    expect(currentUserId()).toBe('');
  });

  it('reports signed-in state and user id', () => {
    store.isValid = true;
    store.record = { id: 'abc123' };
    expect(isSignedIn()).toBe(true);
    expect(currentUserId()).toBe('abc123');
  });
});
