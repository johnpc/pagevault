import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

/** Block types whose bodies are plain editable text that can be joined by a
 * merge (Backspace-at-start or Delete-at-end). Excludes structural/media blocks
 * (divider, image, table, columns, toc) and the richer bodies (code/callout/
 * toggle) where a naive text concat would be surprising — a merge is a no-op
 * for those. */
export const MERGEABLE_TYPES: ReadonlySet<BlockType> = new Set<BlockType>([
  'text',
  'heading',
  'subheading',
  'subsubheading',
  'bullet',
  'numbered',
  'todo',
  'quote',
]);

export interface MergeTarget {
  /** The block that keeps its id and absorbs the merged content. */
  keepId: string;
  /** The block that is deleted (its text folded into keepId). */
  removeId: string;
  /** The merged content written to keepId. */
  content: string;
  /** Where the caret lands after the merge (the join point) — always the
   * length of the upper block's text. */
  caret: number;
  /** The block that should hold focus after the merge (keepId's block). */
  focusId: string;
}

const bothMergeable = (a: BlockRecord, b: BlockRecord) =>
  MERGEABLE_TYPES.has(a.type) && MERGEABLE_TYPES.has(b.type);

/**
 * Backspace at the very start of `sourceId`: merge it into the PREVIOUS block.
 * The previous block absorbs the source's text; focus lands there at the join.
 * Returns null when there's no previous block or either isn't mergeable.
 * `sourceValue` is the source's LIVE textarea value (an unsaved edit hasn't
 * reached the cached record yet). Pure.
 */
export function mergeTarget(
  blocks: BlockRecord[],
  sourceId: string,
  sourceValue: string,
): MergeTarget | null {
  const i = blocks.findIndex((b) => b.id === sourceId);
  if (i <= 0) return null;
  const prev = blocks[i - 1];
  if (!bothMergeable(prev, blocks[i])) return null;
  return {
    keepId: prev.id,
    removeId: sourceId,
    content: prev.content + sourceValue,
    caret: prev.content.length,
    focusId: prev.id,
  };
}

/**
 * Delete at the very end of `currentId`: pull the NEXT block up into this one.
 * This block keeps focus with the caret at the join. Returns null when there's
 * no next block or either isn't mergeable. `currentValue` is this block's LIVE
 * textarea value. Pure — the symmetric complement of mergeTarget.
 */
export function forwardMergeTarget(
  blocks: BlockRecord[],
  currentId: string,
  currentValue: string,
): MergeTarget | null {
  const i = blocks.findIndex((b) => b.id === currentId);
  if (i < 0 || i >= blocks.length - 1) return null;
  const next = blocks[i + 1];
  if (!bothMergeable(blocks[i], next)) return null;
  return {
    keepId: currentId,
    removeId: next.id,
    content: currentValue + next.content,
    caret: currentValue.length,
    focusId: currentId,
  };
}
