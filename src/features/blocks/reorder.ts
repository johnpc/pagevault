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
 * items whose index changed get a new sequential `sort`. Keeps writes small.
 * Generic over anything with an id + sort (blocks, pages, …).
 */
export function sortUpdates(
  reordered: { id: string; sort: number }[],
): { id: string; sort: number }[] {
  const updates: { id: string; sort: number }[] = [];
  reordered.forEach((item, index) => {
    if (item.sort !== index) updates.push({ id: item.id, sort: index });
  });
  return updates;
}

/** The content-carrying fields to copy when duplicating a block. Pure. */
export function cloneFields(block: BlockRecord): Pick<BlockRecord, 'type' | 'content' | 'checked'> {
  return { type: block.type, content: block.content, checked: block.checked };
}

/** Every content/formatting field to copy for a FULL block clone (multi-block
 * duplicate) — unlike cloneFields, this preserves depth/color/align/etc. so a
 * nested, formatted selection duplicates faithfully. id/sort/owner/page are set
 * by the caller. Pure. */
export function fullCloneFields(
  block: BlockRecord,
): Omit<BlockRecord, keyof import('../../lib/pbTypes').BaseRecord | 'sort' | 'owner' | 'page'> {
  return {
    type: block.type,
    content: block.content,
    checked: block.checked,
    collapsed: block.collapsed,
    file: block.file,
    data: block.data,
    color: block.color,
    lang: block.lang,
    emoji: block.emoji,
    align: block.align,
    depth: block.depth,
  };
}

/**
 * The {id, sort} updates to place a contiguous run of `clones` directly after
 * `sourceId` within `blocks` (which already includes the clones, appended at the
 * end). Keeps the clones in their given order. Pure — unit-testable.
 */
export function insertRunAfterUpdates(
  blocks: BlockRecord[],
  clones: BlockRecord[],
  sourceId: string,
): { id: string; sort: number }[] {
  const cloneIds = new Set(clones.map((c) => c.id));
  const ordered = blocks.filter((b) => !cloneIds.has(b.id));
  const srcIdx = ordered.findIndex((b) => b.id === sourceId);
  ordered.splice(srcIdx + 1, 0, ...clones);
  return sortUpdates(ordered);
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
