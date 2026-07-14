import { parseInline, type Segment } from './inlineMarkdown';
import { safeHref } from './safeHref';

/** Escape text for safe insertion as HTML text content (no active markup). */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The inline HTML tag wrapping a styled segment for the WYSIWYG surface. Each
 * carries a data-md attribute so the DOM can be read back to markdown without
 * re-parsing styles. Mentions/links render as styled spans (not <a>) so they're
 * editable in place; their target rides in data-href/data-mention. Pure. */
function segmentToHtml(seg: Segment): string {
  const t = escapeHtml(seg.text);
  if (seg.mentionId)
    return `<span class="pv-w-mention" data-mention="${escapeHtml(seg.mentionId)}">@${t}</span>`;
  if (seg.href) {
    const safe = safeHref(seg.href);
    if (!safe) return `<span>${t}</span>`;
    return `<span class="pv-w-link" data-href="${escapeHtml(safe)}">${t}</span>`;
  }
  if (seg.code) return `<code>${t}</code>`;
  if (seg.bold) return `<strong>${t}</strong>`;
  if (seg.strike) return `<del>${t}</del>`;
  if (seg.underline) return `<u>${t}</u>`;
  if (seg.italic) return `<em>${t}</em>`;
  return `<span>${t}</span>`;
}

/** Render a stored content string to the initial editable HTML for the WYSIWYG
 * surface: styled inline spans the browser can edit directly. Empty content
 * yields '' (the browser shows the placeholder). Pure. */
export function contentToEditableHtml(content: string): string {
  if (content === '') return '';
  return parseInline(content).map(segmentToHtml).join('');
}
