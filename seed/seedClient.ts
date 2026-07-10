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
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL ?? 'admin@pagevault.local';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD ?? 'AdminPass123!';

export function adminClient(): PocketBase {
  return new PocketBase(PB_URL);
}

/** Authenticate as the PocketBase superuser (needed to create/reset users). */
export async function authAdmin(pb: PocketBase): Promise<void> {
  await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
}

/** Ensure the editor test user exists; returns its id. Idempotent. */
export async function ensureTestUser(pb: PocketBase): Promise<string> {
  const existing = await pb
    .collection('users')
    .getFirstListItem(`email = "${TEST_USERNAME}"`)
    .catch(() => null);
  if (existing) return existing.id;
  const created = await pb.collection('users').create({
    email: TEST_USERNAME,
    password: TEST_PASSWORD,
    passwordConfirm: TEST_PASSWORD,
    verified: true,
  });
  return created.id;
}

/** Delete every page + block owned by the given user (a clean slate). */
export async function clearWorkspace(pb: PocketBase, owner: string): Promise<void> {
  for (const collection of ['blocks', 'pages']) {
    const rows = await pb.collection(collection).getFullList({ filter: `owner = "${owner}"` });
    for (const row of rows) await pb.collection(collection).delete(row.id);
  }
}
