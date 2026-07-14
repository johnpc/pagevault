import type { Segment } from './inlineMarkdown';
import { segmentsToMarkdown } from './segmentsToMarkdown';

/** Map a single element node (as produced by contentToEditableHtml, or by the
 * browser while editing) to a styled Segment. Unknown wrappers fall back to
 * plain text so nothing is ever dropped. */
function elementToSegment(el: Element): Segment {
  const text = el.textContent ?? '';
  const mention = el.getAttribute('data-mention');
  if (mention) return { text: text.replace(/^@/, ''), mentionId: mention };
  const href = el.getAttribute('data-href');
  if (href) return { text, href };
  switch (el.tagName) {
    case 'STRONG':
    case 'B':
      return { text, bold: true };
    case 'EM':
    case 'I':
      return { text, italic: true };
    case 'CODE':
      return { text, code: true };
    case 'DEL':
    case 'S':
      return { text, strike: true };
    case 'U':
      return { text, underline: true };
    default:
      return { text };
  }
}

/**
 * Read a contentEditable element's children back into styled segments. Text
 * nodes become plain segments; our styled tags/spans (and the browser's B/I/S
 * equivalents) map to marks; a <br> becomes a newline. Pure w.r.t. the DOM.
 */
export function domToSegments(root: Node): Segment[] {
  const out: Segment[] = [];
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) out.push({ text: node.textContent });
    } else if (node.nodeName === 'BR') {
      out.push({ text: '\n' });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      out.push(elementToSegment(node as Element));
    }
  });
  return out;
}

/** The canonical `content` string for a contentEditable element's current DOM —
 * the inverse of seeding it with contentToEditableHtml. */
export function domToContent(root: Node): string {
  return segmentsToMarkdown(domToSegments(root));
}
