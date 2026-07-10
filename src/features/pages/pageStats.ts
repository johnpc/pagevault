import type { BlockRecord } from '../../lib/pbClient';

/** Word + block counts for a page's blocks. Dividers hold no text. Pure. */
export function pageStats(blocks: BlockRecord[]): { words: number; blocks: number } {
  const words = blocks.reduce((sum, b) => sum + countWords(b.content), 0);
  return { words, blocks: blocks.length };
}

/** Count whitespace-delimited words in a string. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}

/**
 * A short "edited N ago" label from an ISO timestamp, relative to `now` (ms).
 * `now` is injected so it's deterministic under test. Falls back to '' for a
 * missing/invalid timestamp.
 */
export function relativeTime(iso: string, now: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const secs = Math.max(0, Math.round((now - then) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
