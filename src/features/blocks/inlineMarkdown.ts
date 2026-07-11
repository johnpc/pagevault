/** An inline text segment with optional emphasis. Pure output of parseInline. */
export interface Segment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

// Order matters: code first (its contents are literal), then bold (**), then
// italic (*). Each pattern captures the inner text.
const RULES: { re: RegExp; mark: keyof Omit<Segment, 'text'> }[] = [
  { re: /`([^`]+)`/, mark: 'code' },
  { re: /\*\*([^*]+)\*\*/, mark: 'bold' },
  { re: /\*([^*]+)\*/, mark: 'italic' },
];

/**
 * Tokenize a string into styled segments by inline markdown. Non-nesting (a
 * segment carries at most one mark) — enough for bold/italic/code, and fully
 * deterministic + unit-testable. Plain text yields a single plain segment.
 */
export function parseInline(text: string): Segment[] {
  if (text === '') return [];
  // Find the earliest match across all rules.
  let best: {
    index: number;
    length: number;
    inner: string;
    mark: keyof Omit<Segment, 'text'>;
  } | null = null;
  for (const { re, mark } of RULES) {
    const m = re.exec(text);
    if (m && (best === null || m.index < best.index)) {
      best = { index: m.index, length: m[0].length, inner: m[1], mark };
    }
  }
  if (!best) return [{ text }];

  const segments: Segment[] = [];
  if (best.index > 0) segments.push({ text: text.slice(0, best.index) });
  segments.push({ text: best.inner, [best.mark]: true });
  segments.push(...parseInline(text.slice(best.index + best.length)));
  return segments;
}

/** True when the text contains any inline markdown worth rendering. */
export function hasInlineMarkup(text: string): boolean {
  return parseInline(text).some((s) => s.bold || s.italic || s.code);
}
