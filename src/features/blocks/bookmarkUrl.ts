/** Normalize a pasted bookmark URL: trim, and prepend https:// when no scheme
 * is given (so "notion.so" becomes a real link). Empty stays empty. Pure. */
export function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (t === '') return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : `https://${t}`;
}

/** The display domain for a URL (host without a leading www.), falling back to
 * the raw string if it can't be parsed. Pure. */
export function urlDomain(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
