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
