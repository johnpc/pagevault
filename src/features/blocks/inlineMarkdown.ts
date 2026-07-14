import { LINK_SPECIALS } from './inlineLinks';

/** An inline text segment with optional emphasis, a page mention, or an external
 * link. Pure output of parseInline. A mention carries the linked page id in
 * `mentionId`; an external link carries its destination in `href` — both with the
 * page title / link text as `text`. */
export interface Segment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strike?: boolean;
  underline?: boolean;
  mentionId?: string;
  href?: string;
}

type Mark = 'bold' | 'italic' | 'code' | 'strike' | 'underline';

// Order matters: code first (its contents are literal), then the double-char
// marks (**, ~~, __) before the single-char italics (*, _). Each captures the
// inner text. Earliest match across all rules wins, so ordering only breaks
// ties — a double marker at index i beats a single one that can only start at
// i+1 (e.g. __x__ is underline, not italic). Both *word* and _word_ are italic.
const RULES: { re: RegExp; mark: Mark }[] = [
  { re: /`([^`]+)`/, mark: 'code' },
  { re: /\*\*([^*]+)\*\*/, mark: 'bold' },
  { re: /~~([^~]+)~~/, mark: 'strike' },
  { re: /__([^_]+)__/, mark: 'underline' },
  { re: /\*([^*]+)\*/, mark: 'italic' },
  { re: /_([^_]+)_/, mark: 'italic' },
];

interface Match {
  index: number;
  length: number;
  segment: Segment;
}

/** The earliest match across the mention rule + all emphasis rules, or null. */
function firstMatch(text: string): Match | null {
  let best: Match | null = null;
  const consider = (m: Match | null) => {
    if (m && (best === null || m.index < best.index)) best = m;
  };
  for (const { re, match } of LINK_SPECIALS) {
    const m = re.exec(text);
    if (m) {
      const { length, segment } = match(m);
      consider({ index: m.index, length, segment });
    }
  }
  for (const { re, mark } of RULES) {
    const m = re.exec(text);
    if (m) consider({ index: m.index, length: m[0].length, segment: { text: m[1], [mark]: true } });
  }
  return best;
}

/**
 * Tokenize a string into styled segments by inline markdown + page mentions.
 * Non-nesting (a segment carries at most one mark) — enough for bold/italic/code
 * and mentions, and fully deterministic + unit-testable. Plain text yields a
 * single plain segment.
 */
export function parseInline(text: string): Segment[] {
  if (text === '') return [];
  const best = firstMatch(text);
  if (!best) return [{ text }];

  const segments: Segment[] = [];
  if (best.index > 0) segments.push({ text: text.slice(0, best.index) });
  segments.push(best.segment);
  segments.push(...parseInline(text.slice(best.index + best.length)));
  return segments;
}

/** True when the text contains any inline markup worth rendering (emphasis or a
 * mention) — i.e. the idle preview should show formatted, not raw. */
export function hasInlineMarkup(text: string): boolean {
  return parseInline(text).some(
    (s) => s.bold || s.italic || s.code || s.strike || s.underline || s.mentionId || s.href,
  );
}
