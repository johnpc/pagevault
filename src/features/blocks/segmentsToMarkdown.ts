import type { Segment } from './inlineMarkdown';

/**
 * Serialize styled inline segments back to the markdown-ish string stored in
 * `block.content` — the inverse of parseInline. This is the bridge a WYSIWYG
 * editing surface needs: it edits segments (or a rich doc), then writes the
 * canonical string on change. Round-trips with parseInline for the marks the
 * editor produces (bold/italic/code/strike/underline, mentions, links).
 *
 * Marker precedence matches the parser: a mention wins, then an external link,
 * then a single emphasis mark (a segment carries at most one mark — the model is
 * non-nesting, same as parseInline). Plain text passes through. Pure.
 */
export function segmentToMarkdown(seg: Segment): string {
  if (seg.mentionId) return `@[${seg.text}](${seg.mentionId})`;
  if (seg.href) return `[${seg.text}](${seg.href})`;
  if (seg.code) return `\`${seg.text}\``;
  if (seg.bold) return `**${seg.text}**`;
  if (seg.strike) return `~~${seg.text}~~`;
  if (seg.underline) return `__${seg.text}__`;
  if (seg.italic) return `*${seg.text}*`;
  return seg.text;
}

/** Serialize a list of segments to the stored content string. Pure. */
export function segmentsToMarkdown(segments: Segment[]): string {
  return segments.map(segmentToMarkdown).join('');
}
