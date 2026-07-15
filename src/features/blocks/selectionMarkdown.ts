import type { BlockRecord } from '../../lib/pbClient';
import { blockToMarkdown } from './exportMarkdown';

/**
 * Serialize an ordered run of blocks to Markdown (no page title) — used to copy
 * a block selection to the clipboard so it can be pasted back as blocks (the
 * paste handler imports markdown). Consecutive numbered blocks count up,
 * resetting when the run breaks. Pure — mirrors pageToMarkdown's body.
 */
export function blocksToMarkdown(blocks: BlockRecord[]): string {
  let ordinal = 0;
  return blocks
    .map((block) => {
      ordinal = block.type === 'numbered' ? ordinal + 1 : 0;
      return blockToMarkdown(block, ordinal);
    })
    .join('\n\n');
}
