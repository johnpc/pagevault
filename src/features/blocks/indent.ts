import type { BlockRecord } from '../../lib/pbClient';

/** Max allowed depth: one deeper than the block directly above `index`, else 0
 * at the top. Prevents "orphan" jumps where a block indents past its parent. */
export function maxDepthAt(blocks: BlockRecord[], index: number): number {
  if (index <= 0) return 0;
  return (blocks[index - 1].depth ?? 0) + 1;
}

/**
 * The new depth when indenting (dir 'in') or outdenting (dir 'out') the block at
 * `index`. Indent is capped at maxDepthAt; outdent floors at 0. Returns the same
 * depth (no change) when already at the bound. Pure — unit-testable.
 */
export function indentDepth(blocks: BlockRecord[], index: number, dir: 'in' | 'out'): number {
  const current = blocks[index]?.depth ?? 0;
  if (dir === 'out') return Math.max(0, current - 1);
  return Math.min(current + 1, maxDepthAt(blocks, index));
}

/**
 * The minimal {id, depth} updates to indent/outdent a set of selected block ids,
 * processed in document order so an earlier block's new depth informs the
 * maxDepthAt cap of a later selected child. Only blocks whose depth changes are
 * returned. Pure — no I/O.
 */
export function indentUpdates(
  blocks: BlockRecord[],
  selectedIds: string[],
  dir: 'in' | 'out',
): { id: string; depth: number }[] {
  const chosen = new Set(selectedIds);
  const working = blocks.map((b) => ({ ...b })); // each computed depth feeds the next cap
  const updates: { id: string; depth: number }[] = [];
  working.forEach((b, i) => {
    if (!chosen.has(b.id)) return;
    const depth = indentDepth(working, i, dir);
    if (depth !== (b.depth ?? 0)) {
      b.depth = depth;
      updates.push({ id: b.id, depth });
    }
  });
  return updates;
}
