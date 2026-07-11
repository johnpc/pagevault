import type { BlockRecord, PageRecord } from '../../lib/pbClient';
import { displayTitle } from '../pages/pageTree';

/** Serialize one block to its Markdown line. `ordinal` is the 1-based position
 * among consecutive numbered blocks (for `1.`, `2.`, …). Pure. */
export function blockToMarkdown(
  block: Pick<BlockRecord, 'type' | 'content' | 'checked'>,
  ordinal = 1,
): string {
  const text = block.content;
  switch (block.type) {
    case 'heading':
      return `# ${text}`;
    case 'subheading':
      return `## ${text}`;
    case 'bullet':
      return `- ${text}`;
    case 'numbered':
      return `${ordinal}. ${text}`;
    case 'todo':
      return `- [${block.checked ? 'x' : ' '}] ${text}`;
    case 'quote':
      return `> ${text}`;
    case 'code':
      return '```\n' + text + '\n```';
    case 'image':
      return `![](${text})`;
    case 'callout':
      return `> 💡 ${text}`;
    case 'divider':
      return '---';
    default:
      return text;
  }
}

/**
 * Serialize a page (title + ordered blocks) to a Markdown document. Consecutive
 * numbered blocks count up (resetting when the run breaks). Pure — unit-tested.
 */
export function pageToMarkdown(
  page: Pick<PageRecord, 'title' | 'icon'>,
  blocks: BlockRecord[],
): string {
  const heading = `# ${page.icon ? `${page.icon} ` : ''}${displayTitle(page)}`;
  let ordinal = 0;
  const lines = blocks.map((block) => {
    ordinal = block.type === 'numbered' ? ordinal + 1 : 0;
    return blockToMarkdown(block, ordinal);
  });
  return [heading, '', ...lines].join('\n\n');
}

/** A filesystem-safe slug for the exported file name. */
export function fileSlug(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'untitled';
}
