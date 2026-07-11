import type { BlockRecord, PageRecord } from '../../lib/pbClient';
import type { TableData, ColumnsData } from '../../lib/pbTypes';
import { displayTitle } from '../pages/pageTree';
import { normalize } from './tableData';
import { normalizeColumns } from './columnsData';

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

/** Columns flatten to their contents separated by a rule — Markdown has no
 * native side-by-side layout. Pure. */
function columnsToMarkdown(data: ColumnsData | null): string {
  return normalizeColumns(data).cols.filter(Boolean).join('\n\n---\n\n');
}

/** The simple prefix-style renderers, keyed by block type. */
const PREFIX: Partial<Record<BlockRecord['type'], (t: string) => string>> = {
  heading: (t) => `# ${t}`,
  subheading: (t) => `## ${t}`,
  bullet: (t) => `- ${t}`,
  quote: (t) => `> ${t}`,
  code: (t) => '```\n' + t + '\n```',
  image: (t) => `![](${t})`,
  callout: (t) => `> 💡 ${t}`,
  toggle: (t) => `▸ **${t}**`,
};

/** Serialize one block to its Markdown line. `ordinal` is the 1-based position
 * among consecutive numbered blocks (for `1.`, `2.`, …). Pure. */
export function blockToMarkdown(
  block: Pick<BlockRecord, 'type' | 'content' | 'checked' | 'data'>,
  ordinal = 1,
): string {
  const text = block.content;
  const prefix = PREFIX[block.type];
  if (prefix) return prefix(text);
  switch (block.type) {
    case 'numbered':
      return `${ordinal}. ${text}`;
    case 'todo':
      return `- [${block.checked ? 'x' : ' '}] ${text}`;
    case 'table':
      return tableToMarkdown(block.data as TableData | null);
    case 'columns':
      return columnsToMarkdown(block.data as ColumnsData | null);
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
