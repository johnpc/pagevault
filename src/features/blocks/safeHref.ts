// URL schemes we allow in a rendered href. Anything else (javascript:, data:,
// vbscript:, …) is an XSS vector once placed in an <a href>, so it's rejected.
const SAFE_SCHEME = /^(https?|mailto|tel)$/i;

/**
 * Sanitize a user-supplied URL for use in an href. Returns the URL when it's
 * safe to link — an allowed scheme (http/https/mailto/tel), or a schemeless /
 * relative / anchor URL — and null when it must NOT be linked (e.g.
 * `javascript:` / `data:` payloads from pasted or shared markdown). Callers
 * render the link only when this is non-null, else fall back to plain text.
 * Pure.
 */
export function safeHref(url: string): string | null {
  const t = url.trim();
  if (t === '') return null;
  if (/^[#/?]/.test(t)) return t; // anchor / absolute-path / query — no scheme
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(t);
  if (!scheme) return t; // no scheme at all (e.g. "example.com/x") — safe
  return SAFE_SCHEME.test(scheme[1]) ? t : null;
}
