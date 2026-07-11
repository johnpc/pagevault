import { pb } from '../../lib/pbClient';
import type { BlockRecord } from '../../lib/pbClient';

/**
 * The <img> src for an image block: the uploaded file's served URL when the
 * block has a `file`, otherwise the remote URL kept in `content`. Returns '' when
 * neither is set (the block still needs a source). Kept tiny + injectable so the
 * component stays render-only.
 */
export function imageSrc(
  block: Pick<BlockRecord, 'file' | 'content'> & Partial<BlockRecord>,
): string {
  if (block.file) return pb.files.getURL(block as BlockRecord, block.file);
  return block.content ?? '';
}

/** Whether an image block has any source to render yet. Pure. */
export function hasImageSource(block: Pick<BlockRecord, 'file' | 'content'>): boolean {
  return !!block.file || !!block.content;
}
