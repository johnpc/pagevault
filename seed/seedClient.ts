/**
 * Seed helpers for PageVault's PocketBase backend. The seed is idempotent: it
 * ensures the editor test user exists, then resets that user's workspace to a
 * known starter state (used by e2e + local dev). Superuser credentials come
 * from the env (.env.local locally, workflow env in CI).
 */
import PocketBase from 'pocketbase';

export const PB_URL = process.env.VITE_PB_URL ?? 'http://localhost:8090';
export const TEST_USERNAME = process.env.TEST_USERNAME ?? 'test@example.com';
export const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'TestPassw0rd!';
// A second account for collaboration e2e (joining a shared page as another user).
export const COLLAB_USERNAME = process.env.COLLAB_USERNAME ?? 'collab@example.com';
export const COLLAB_PASSWORD = process.env.COLLAB_PASSWORD ?? 'TestPassw0rd!';
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL ?? 'admin@pagevault.local';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD ?? 'AdminPass123!';

export function adminClient(): PocketBase {
  return new PocketBase(PB_URL);
}

/** Authenticate as the PocketBase superuser (needed to create/reset users). */
export async function authAdmin(pb: PocketBase): Promise<void> {
  await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
}

/** Ensure a user with these credentials exists; returns its id. Idempotent. */
export async function ensureUser(pb: PocketBase, email: string, password: string): Promise<string> {
  const existing = await pb
    .collection('users')
    .getFirstListItem(`email = "${email}"`)
    .catch(() => null);
  if (existing) return existing.id;
  const created = await pb
    .collection('users')
    .create({ email, password, passwordConfirm: password, verified: true });
  return created.id;
}

/** Ensure the editor test user exists; returns its id. Idempotent. */
export function ensureTestUser(pb: PocketBase): Promise<string> {
  return ensureUser(pb, TEST_USERNAME, TEST_PASSWORD);
}

/** Ensure the second collaborator user exists; returns its id. Idempotent. */
export function ensureCollaboratorUser(pb: PocketBase): Promise<string> {
  return ensureUser(pb, COLLAB_USERNAME, COLLAB_PASSWORD);
}

/** Delete every page + block owned by the given user (a clean slate). */
export async function clearWorkspace(pb: PocketBase, owner: string): Promise<void> {
  for (const collection of ['blocks', 'pages']) {
    const rows = await pb.collection(collection).getFullList({ filter: `owner = "${owner}"` });
    for (const row of rows) await pb.collection(collection).delete(row.id);
  }
}
