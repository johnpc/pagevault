/**
 * Auth server-state, wrapping the PocketBase auth store. These are the only
 * places the app calls PocketBase's auth methods; UI goes through useAuth().
 */
import { pb } from '../../lib/pbClient';
import type { UserRecord } from '../../lib/pbClient';

export async function signIn(email: string, password: string): Promise<UserRecord> {
  const res = await pb.collection('users').authWithPassword(email, password);
  return res.record as unknown as UserRecord;
}

export async function register(email: string, password: string): Promise<UserRecord> {
  await pb.collection('users').create({ email, password, passwordConfirm: password });
  return signIn(email, password);
}

export function signOut(): void {
  pb.authStore.clear();
}

/** The signed-in user (from the persisted store), or null when signed out. */
export function currentUser(): UserRecord | null {
  return pb.authStore.isValid ? (pb.authStore.record as unknown as UserRecord) : null;
}
