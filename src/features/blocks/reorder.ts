import type { BlockRecord } from '../../lib/pbClient';

/**
 * Pure reorder logic for the block list. Given the current ordered blocks and a
 * drag from one id to the position of another, return the reordered list. No
 * I/O — trivially unit-testable.
 */
export function moveBlock(blocks: BlockRecord[], fromId: string, toId: string): BlockRecord[] {
  if (fromId === toId) return blocks;
  const from = blocks.findIndex((b) => b.id === fromId);
  const to = blocks.findIndex((b) => b.id === toId);
  if (from === -1 || to === -1) return blocks;
  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * The minimal set of {id, sort} updates to persist a reordered list: only the
 * blocks whose index changed get a new sequential `sort`. Keeps writes small.
 */
export function sortUpdates(reordered: BlockRecord[]): { id: string; sort: number }[] {
  const updates: { id: string; sort: number }[] = [];
  reordered.forEach((block, index) => {
    if (block.sort !== index) updates.push({ id: block.id, sort: index });
  });
  return updates;
}

/** The content-carrying fields to copy when duplicating a block. Pure. */
export function cloneFields(block: BlockRecord): Pick<BlockRecord, 'type' | 'content' | 'checked'> {
  return { type: block.type, content: block.content, checked: block.checked };
}

/**
 * The {id, sort} updates to place `clone` directly after `sourceId` within
 * `blocks` (which already includes the clone). Pure — unit-testable.
 */
export function insertAfterUpdates(
  blocks: BlockRecord[],
  clone: BlockRecord,
  sourceId: string,
): { id: string; sort: number }[] {
  const ordered = blocks.filter((b) => b.id !== clone.id);
  const srcIdx = ordered.findIndex((b) => b.id === sourceId);
  ordered.splice(srcIdx + 1, 0, clone);
  return sortUpdates(ordered);
}
