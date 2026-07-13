import type { TestInfo } from '@playwright/test';

/**
 * Make a page title unique per scenario ATTEMPT so tests never collide on the
 * shared backend. Root cause of the old "typing" flake: retries / --repeat-each
 * / parallel workers all created a page called e.g. "Trip plan", and a lookup
 * via `.first()` could open the DIRTY page from a prior attempt — so typing
 * appended ("Trip to Japan# Trip to Japan") and the "empty list item" was no
 * longer empty. Reproduced deterministically with `--repeat-each=3`.
 *
 * The suffix comes from testId + retry: stable within one attempt (create and
 * every later lookup agree) but distinct across attempts/workers.
 *
 * Two titles are NOT scenario-created and must pass through unchanged:
 *   - seed titles (SEED_TITLES) referenced as fixtures (e.g. a move target).
 * And a derived "(copy)" title uniquifies its BASE, then re-appends " (copy)",
 * because the app derives the copy's name from the (already-unique) original.
 */
const SEED_TITLES = new Set(['Reading list', 'Welcome to PageVault']);

export function uniqueTitle(base: string, info: TestInfo): string {
  if (SEED_TITLES.has(base)) return base;
  if (base.endsWith(' (copy)'))
    return `${uniqueTitle(base.slice(0, -' (copy)'.length), info)} (copy)`;
  const key = `${info.testId}#${info.retry}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) & 0x7fffffff;
  return `${base} ~${hash.toString(36)}`;
}
