import type { BlockRecord, PageRecord } from '../../lib/pbClient';
import type { TableData } from '../../lib/pbTypes';
import { displayTitle } from '../pages/pageTree';
import { normalize } from './tableData';

/** A GFM table from a block's grid data. Checkbox cells render as ✓ / blank.
 * Pure. */
function tableToMarkdown(data: TableData | null): string {
  const { columns, rows } = normalize(data);
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
  const header = line(columns.map((c) => c.name));
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const cell = (value: string, colIdx: number) =>
    columns[colIdx]?.type === 'checkbox' ? (value === 'true' ? '✓' : '') : value;
  const body = rows.map((r) => line(r.map(cell)));
  return [header, divider, ...body].join('\n');
}

/** Serialize one block to its Markdown line. `ordinal` is the 1-based position
 * among consecutive numbered blocks (for `1.`, `2.`, …). Pure. */
export function blockToMarkdown(
  block: Pick<BlockRecord, 'type' | 'content' | 'checked' | 'data'>,
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
    case 'toggle':
      return `▸ **${text}**`;
    case 'table':
      return tableToMarkdown(block.data);
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
