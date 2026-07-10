/**
 * Idempotent seed runner. Re-running converges to the same state:
 *   1. auth as superuser
 *   2. ensure the editor test user exists
 *   3. clear that user's workspace
 *   4. write the starter pages + blocks
 *
 * Loads .env.local so it runs locally without extra flags; in CI the same vars
 * come from the workflow env. Run: `npm run seed`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { authAdmin, ensureTestUser, clearWorkspace, adminClient } from './seedClient';
import { seedWorkspace } from './seedWorkspace';

if (existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

async function main() {
  const pb = adminClient();
  await authAdmin(pb);
  const owner = await ensureTestUser(pb);
  await clearWorkspace(pb, owner);
  const pages = await seedWorkspace(pb, owner);
  console.log(`✓ Seeded ${pages} starter pages for the test user.`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
