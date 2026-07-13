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
  it('creates a row when none exists', async () => {
    presence.getFirstListItem.mockRejectedValue(new Error('404'));
    await heartbeat('pg');
    expect(presence.create).toHaveBeenCalledWith({ page: 'pg', user: 'me' });
    expect(presence.update).not.toHaveBeenCalled();
  });

  it('touches the existing row when present', async () => {
    presence.getFirstListItem.mockResolvedValue({ id: 'row1' });
    await heartbeat('pg');
    expect(presence.update).toHaveBeenCalledWith('row1', { user: 'me' });
    expect(presence.create).not.toHaveBeenCalled();
  });

  it('no-ops when signed out', async () => {
    currentUser.id = '';
    await heartbeat('pg');
    expect(presence.getFirstListItem).not.toHaveBeenCalled();
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
