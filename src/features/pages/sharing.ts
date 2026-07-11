/** Sharing helpers: pure token generation + the public share URL. */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * A random share-token slug of `len` chars. `rand` returns [0,1) — injected so
 * the generator is deterministic under test (defaults to Math.random in app).
 */
export function makeShareToken(len = 16, rand: () => number = Math.random): string {
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[Math.floor(rand() * ALPHABET.length)];
  return out;
}

/** The absolute public URL for a share token, given the current origin. */
export function shareUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, '')}/shared/${token}`;
}
