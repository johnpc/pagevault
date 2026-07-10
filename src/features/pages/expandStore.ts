/**
 * Sidebar expand/collapse state, persisted in localStorage so the tree keeps
 * its shape across reloads. A page id present in the set is COLLAPSED (default
 * is expanded), so a fresh workspace shows everything open. Pure I/O helpers.
 */
const STORAGE_KEY = 'pv-collapsed';

export function readCollapsed(): Set<string> {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function writeCollapsed(collapsed: Set<string>): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify([...collapsed]));
  } catch {
    /* storage unavailable — collapse state just won't persist */
  }
}

/** Toggle one id's collapsed state, returning a NEW set (immutable update). */
export function toggleCollapsed(collapsed: Set<string>, id: string): Set<string> {
  const next = new Set(collapsed);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
