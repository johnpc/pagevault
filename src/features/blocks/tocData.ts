import type { BlockRecord } from '../../lib/pbClient';

/** One entry in a table of contents: a heading block's id, its text, and a
 * level (1 = heading, 2 = subheading) for indentation. */
export interface TocEntry {
  id: string;
  text: string;
  level: 1 | 2;
}

/** The DOM id an anchor uses for a block row, so a TOC link can scroll to it. */
export function blockAnchorId(blockId: string): string {
  return `pv-block-${blockId}`;
}

/**
 * Build the table of contents from a page's blocks: every heading/subheading
 * with non-empty text, in document order. Pure — unit-testable.
 */
export function tableOfContents(blocks: BlockRecord[]): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const b of blocks) {
    const level = b.type === 'heading' ? 1 : b.type === 'subheading' ? 2 : 0;
    if (level === 0) continue;
    const text = b.content.trim();
    if (text === '') continue;
    entries.push({ id: b.id, text, level: level as 1 | 2 });
  }
  return entries;
}
