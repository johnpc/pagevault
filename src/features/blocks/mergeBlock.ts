import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

/** Block types whose bodies are plain editable text that can be joined by a
 * Backspace-at-start merge. Excludes structural/media blocks (divider, image,
 * table, columns, toc) and the richer bodies (code/callout/toggle) where a naive
 * text concat would be surprising — Backspace-at-start is a no-op for those. */
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
  /** The previous block that absorbs the source's content. */
  prev: BlockRecord;
  /** The merged content = prev.content + source.content. */
  content: string;
  /** Where the caret should land after the merge (the original join point). */
  caret: number;
}

/**
 * Decide the result of pressing Backspace at the very start of `sourceId`:
 * merge it into the previous block. Returns null when there is no previous
 * block, or either block isn't a mergeable text type. `blocks` is the ordered
 * VISIBLE list (the same order the user sees). `sourceValue` is the source's
 * LIVE textarea value — passed in because an unsaved edit hasn't reached the
 * cached record yet (mirrors the split path). Pure.
 */
export function mergeTarget(
  blocks: BlockRecord[],
  sourceId: string,
  sourceValue: string,
): MergeTarget | null {
  const i = blocks.findIndex((b) => b.id === sourceId);
  if (i <= 0) return null;
  const prev = blocks[i - 1];
  const source = blocks[i];
  if (!MERGEABLE_TYPES.has(prev.type) || !MERGEABLE_TYPES.has(source.type)) return null;
  return { prev, content: prev.content + sourceValue, caret: prev.content.length };
}
