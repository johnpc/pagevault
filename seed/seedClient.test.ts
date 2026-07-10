import { describe, it, expect, vi } from 'vitest';
import { ensureTestUser, clearWorkspace, adminClient, authAdmin, PB_URL } from './seedClient';

/** A minimal fake PocketBase whose collections are configurable per test. */
function fakePb(handlers: Record<string, unknown>) {
  return { collection: (name: string) => handlers[name] } as never;
}

describe('seedClient', () => {
  it('adminClient targets the configured URL and authAdmin signs in', async () => {
    const pb = adminClient();
    expect(pb.baseURL).toBe(PB_URL);
    const authWithPassword = vi.fn().mockResolvedValue({});
    await authAdmin(fakePb({ _superusers: { authWithPassword } }));
    expect(authWithPassword).toHaveBeenCalled();
  });

  it('ensureTestUser returns the existing user id when present', async () => {
    const pb = fakePb({
      users: { getFirstListItem: vi.fn().mockResolvedValue({ id: 'existing' }), create: vi.fn() },
    });
    expect(await ensureTestUser(pb)).toBe('existing');
  });

  it('ensureTestUser creates the user when absent', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'fresh' });
    const pb = fakePb({
      users: { getFirstListItem: vi.fn().mockRejectedValue(new Error('404')), create },
    });
    expect(await ensureTestUser(pb)).toBe('fresh');
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ verified: true }));
  });

  it('clearWorkspace deletes every block then page for the owner', async () => {
    const del = vi.fn().mockResolvedValue(true);
    const lists: Record<string, unknown[]> = {
      blocks: [{ id: 'b1' }, { id: 'b2' }],
      pages: [{ id: 'p1' }],
    };
    const pb = fakePb({
      blocks: { getFullList: vi.fn(async () => lists.blocks), delete: del },
      pages: { getFullList: vi.fn(async () => lists.pages), delete: del },
    });
    await clearWorkspace(pb, 'owner1');
    expect(del).toHaveBeenCalledTimes(3);
  });
});
