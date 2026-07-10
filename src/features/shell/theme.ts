/**
 * Explicit theme override (Light / Dark / System), persisted in localStorage
 * and applied by setting [data-theme] on <html>. The token media query in
 * variables.css keys off both this attribute and prefers-color-scheme, so
 * "System" simply removes the attribute and lets the OS decide.
 */
export type ThemeChoice = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'pv-theme';

export function readTheme(): ThemeChoice {
  const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function applyTheme(choice: ThemeChoice): void {
  const root = globalThis.document?.documentElement;
  if (!root) return;
  if (choice === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
  globalThis.localStorage?.setItem(STORAGE_KEY, choice);
}
