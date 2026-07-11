import type { BlockRecord } from '../../lib/pbClient';

/**
 * The ids of blocks hidden by collapsed toggles. A collapsed `toggle` hides the
 * contiguous run of blocks immediately after it that are nested deeper than it
 * (depth > the toggle's depth) — its children — exactly like Notion. Nested
 * collapsed toggles inside a hidden run stay hidden regardless. Pure + total.
 */
export function hiddenBlockIds(blocks: BlockRecord[]): Set<string> {
  const hidden = new Set<string>();
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type !== 'toggle' || !block.collapsed) continue;
    const depth = block.depth ?? 0;
    // Swallow every following block deeper than this toggle, until we hit one at
    // the toggle's depth or shallower (a sibling / ancestor).
    for (let j = i + 1; j < blocks.length && (blocks[j].depth ?? 0) > depth; j++) {
      hidden.add(blocks[j].id);
    }
  }
  return hidden;
}

/** Whether a toggle currently has any nested children (a deeper next block). */
export function toggleHasChildren(blocks: BlockRecord[], index: number): boolean {
  const depth = blocks[index]?.depth ?? 0;
  const next = blocks[index + 1];
  return !!next && (next.depth ?? 0) > depth;
}
