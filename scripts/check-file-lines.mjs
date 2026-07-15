#!/usr/bin/env node
/**
 * File-length discipline: every source file (.ts and .tsx) must stay short
 * and single-purpose. Anything over MAX_LINES is a signal to extract logic
 * into a smaller, tested helper or split the file. Fails the build if any
 * source file is too long. Test files are exempt.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const MAX_LINES = 100;
// Every source tree we author — app code (src) AND the backend seed LOGIC
// (seed/). The PocketBase schema itself lives in pb_migrations/*.js (declarative
// JS, not TS) so it's outside this walk by construction.
const ROOTS = ['src', 'seed'].map((d) => join(process.cwd(), d));
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'pb_data']);
// Exempt pure DATA files (records, not logic) — the seed fixtures tree.
const EXCLUDE_DIRS = ['seed/fixtures'];
// The slash-command catalog is a flat record list (like the seed fixtures), not
// branching logic — exempt it so adding a block type doesn't hit the line gate.
const EXCLUDE_FILES = ['src/features/blocks/slashCatalog.ts'];
const isExcluded = (rel) =>
  EXCLUDE_DIRS.some((p) => rel === p || rel.startsWith(`${p}/`)) || EXCLUDE_FILES.includes(rel);

/** @returns {string[]} */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const rel = relative(process.cwd(), full).split('\\').join('/');
    if (isExcluded(rel)) continue;
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (
      (entry.endsWith('.ts') || entry.endsWith('.tsx')) &&
      !entry.endsWith('.test.ts') &&
      !entry.endsWith('.test.tsx') &&
      !entry.endsWith('.d.ts')
    ) {
      out.push(full);
    }
  }
  return out;
}

const offenders = [];
for (const root of ROOTS) {
  if (!existsSync(root)) continue;
  for (const file of walk(root)) {
    const lines = readFileSync(file, 'utf8').split('\n').length;
    if (lines > MAX_LINES) offenders.push({ file: relative(process.cwd(), file), lines });
  }
}

if (offenders.length > 0) {
  console.error(`\n✖ Source files exceeding ${MAX_LINES} lines:`);
  for (const o of offenders) console.error(`    ${o.file} — ${o.lines} lines`);
  console.error(
    `\n  This limit reduces complexity, not line count. Don't game it by deleting\n` +
      `  comments or blank lines — extract a function to genuinely simplify the file.\n`,
  );
  process.exit(1);
}

console.log(`✓ All source files are within ${MAX_LINES} lines.`);
