import { describe, it, expect, vi, beforeEach } from 'vitest';

// The factory is hoisted, so it must own the mock objects; the test reads them
// back through the mocked module.
vi.mock('../../lib/pbClient', () => {
  const users = { authWithPassword: vi.fn(), create: vi.fn() };
  const authStore = { isValid: false, record: null as { id: string } | null, clear: vi.fn() };
  return { pb: { collection: () => users, authStore }, __users: users, __authStore: authStore };
});

import { signIn, register, signOut, currentUser } from './authApi';
import * as pbClient from '../../lib/pbClient';

const users = (
  pbClient as unknown as {
    __users: { authWithPassword: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  }
).__users;
const authStore = (
  pbClient as unknown as {
    __authStore: {
      isValid: boolean;
      record: { id: string } | null;
      clear: ReturnType<typeof vi.fn>;
    };
  }
).__authStore;

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStore.isValid = false;
    authStore.record = null;
  });

  it('signIn authenticates and returns the record', async () => {
    users.authWithPassword.mockResolvedValue({ record: { id: 'u1', email: 'a@b.c' } });
    const user = await signIn('a@b.c', 'pw');
    expect(user.id).toBe('u1');
    expect(users.authWithPassword).toHaveBeenCalledWith('a@b.c', 'pw');
  });

  it('register creates then signs in', async () => {
    users.create.mockResolvedValue({ id: 'u2' });
    users.authWithPassword.mockResolvedValue({ record: { id: 'u2' } });
    const user = await register('a@b.c', 'pw');
    expect(users.create).toHaveBeenCalledWith({
      email: 'a@b.c',
      password: 'pw',
      passwordConfirm: 'pw',
    });
    expect(user.id).toBe('u2');
  });

  it('signOut clears the store', () => {
    signOut();
    expect(authStore.clear).toHaveBeenCalled();
  });

  it('currentUser reflects the store', () => {
    expect(currentUser()).toBeNull();
    authStore.isValid = true;
    authStore.record = { id: 'u1' };
    expect(currentUser()?.id).toBe('u1');
  });
});
