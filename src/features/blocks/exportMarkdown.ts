import type { BlockRecord, PageRecord } from '../../lib/pbClient';
import type { TableData, ColumnsData } from '../../lib/pbTypes';
import { displayTitle } from '../pages/pageTree';
import { tableToMarkdown, columnsToMarkdown } from './tableMarkdown';
import { inlineToMarkdown } from './inlineToMarkdown';

/** The simple prefix-style renderers, keyed by block type. */
const PREFIX: Partial<Record<BlockRecord['type'], (t: string) => string>> = {
  heading: (t) => `# ${t}`,
  subheading: (t) => `## ${t}`,
  subsubheading: (t) => `### ${t}`,
  bullet: (t) => `- ${t}`,
  quote: (t) => `> ${t}`,
  image: (t) => `![](${t})`,
  toggle: (t) => `▸ **${t}**`,
};

/** List block types whose Markdown nests via leading indentation (2 spaces per
 * depth level, GFM-style). Other blocks always export flush-left. */
const NESTS = new Set<BlockRecord['type']>(['bullet', 'numbered', 'todo']);

type ExportBlock = Pick<
  BlockRecord,
  'type' | 'content' | 'checked' | 'data' | 'lang' | 'emoji' | 'depth'
>;

/** The non-prefix block renderers (block types with more than a fixed prefix).
 * Split from blockToMarkdown so that stays low-complexity. `pad` is the depth
 * indent (already computed) and `ordinal` the numbered-list position. */
function renderComplex(block: ExportBlock, pad: string, ordinal: number): string {
  const text = block.content;
  switch (block.type) {
    case 'callout':
      return `> ${block.emoji || '💡'} ${text}`; // lead with the chosen icon
    case 'code':
      return '```' + (block.lang ?? '') + '\n' + text + '\n```'; // fenced language
    case 'numbered':
      return `${pad}${ordinal}. ${text}`;
    case 'todo':
      return `${pad}- [${block.checked ? 'x' : ' '}] ${text}`;
    case 'table':
      return tableToMarkdown(block.data as TableData | null);
    case 'columns':
      return columnsToMarkdown(block.data as ColumnsData | null);
    case 'divider':
      return '---';
    case 'bookmark':
    case 'embed':
      return text ? `[${text}](${text})` : '';
    default:
      return text;
  }
}

/** Serialize one block to its Markdown line. `ordinal` is the 1-based position
 * among consecutive numbered blocks (for `1.`, `2.`, …). List items indent by
 * their `depth` so nested lists survive the round-trip. Page-mention tokens are
 * rewritten to portable Markdown links (except in code, which stays literal).
 * Pure. */
export function blockToMarkdown(block: ExportBlock, ordinal = 1): string {
  const pad = NESTS.has(block.type) ? '  '.repeat(Math.max(0, block.depth ?? 0)) : '';
  // Code content is literal; other blocks get @-mention tokens → Markdown links.
  const src =
    block.type === 'code' ? block : { ...block, content: inlineToMarkdown(block.content) };
  const prefix = PREFIX[src.type];
  return prefix ? pad + prefix(src.content) : renderComplex(src, pad, ordinal);
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
