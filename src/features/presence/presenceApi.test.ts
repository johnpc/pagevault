import { describe, it, expect, vi, beforeEach } from 'vitest';

const { presence, currentUser } = vi.hoisted(() => ({
  presence: {
    getFullList: vi.fn(),
    getFirstListItem: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  currentUser: { id: 'me' },
}));
vi.mock('../../lib/pbClient', () => ({
  pb: { collection: () => presence },
  currentUserId: () => currentUser.id,
}));

import { fetchPresence, heartbeat, clearPresence } from './presenceApi';

beforeEach(() => {
  vi.clearAllMocks();
  currentUser.id = 'me';
  presence.delete.mockResolvedValue(true);
  presence.create.mockResolvedValue({});
  presence.update.mockResolvedValue({});
});

describe('fetchPresence', () => {
  it('lists a page presence with the user expanded', async () => {
    presence.getFullList.mockResolvedValue([{ id: 'p1' }]);
    const rows = await fetchPresence('pg');
    expect(presence.getFullList).toHaveBeenCalledWith({ filter: "page = 'pg'", expand: 'user' });
    expect(rows).toHaveLength(1);
  });
});

describe('heartbeat', () => {
  it('creates a row (with focused block) when none exists', async () => {
    presence.getFirstListItem.mockRejectedValue(new Error('404'));
    await heartbeat('pg', 'b1');
    expect(presence.create).toHaveBeenCalledWith({ page: 'pg', user: 'me', block: 'b1' });
    expect(presence.update).not.toHaveBeenCalled();
  });

  it('touches the existing row with the current block (defaults to none)', async () => {
    presence.getFirstListItem.mockResolvedValue({ id: 'row1' });
    await heartbeat('pg');
    expect(presence.update).toHaveBeenCalledWith('row1', { user: 'me', block: '' });
    expect(presence.create).not.toHaveBeenCalled();
  });

  it('no-ops when signed out', async () => {
    currentUser.id = '';
    await heartbeat('pg');
    expect(presence.getFirstListItem).not.toHaveBeenCalled();
  });

  it('recovers from a concurrent-create conflict by touching the winning row', async () => {
    // First find → none (so we create); create races and rejects (unique); re-find
    // now sees the row a concurrent heartbeat created → we update it, not throw.
    presence.getFirstListItem.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'won' });
    presence.create.mockRejectedValueOnce(new Error('validation_not_unique'));
    await expect(heartbeat('pg', 'b2')).resolves.toBeUndefined();
    expect(presence.update).toHaveBeenCalledWith('won', { user: 'me', block: 'b2' });
  });
});

describe('clearPresence', () => {
  it('deletes the caller row when it exists', async () => {
    presence.getFirstListItem.mockResolvedValue({ id: 'row1' });
    await clearPresence('pg');
    expect(presence.delete).toHaveBeenCalledWith('row1');
  });

  it('no-ops when there is no row', async () => {
    presence.getFirstListItem.mockRejectedValue(new Error('404'));
    await clearPresence('pg');
    expect(presence.delete).not.toHaveBeenCalled();
  });
});
