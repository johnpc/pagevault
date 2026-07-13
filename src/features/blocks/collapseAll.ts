import type { BlockRecord } from '../../lib/pbClient';

/** Every toggle block on the page (those that can be collapsed/expanded). */
export function toggleBlocks(blocks: BlockRecord[]): BlockRecord[] {
  return blocks.filter((b) => b.type === 'toggle');
}

/** Whether a "collapse all" (vs "expand all") is the useful next action: if any
 * toggle is currently open, collapsing all is offered; else expanding all. Pure. */
export function shouldCollapseAll(blocks: BlockRecord[]): boolean {
  return toggleBlocks(blocks).some((b) => !b.collapsed);
}

/** The minimal {id, collapsed} updates to set every toggle to `collapsed` —
 * only the toggles whose state actually changes. Pure. */
export function collapseUpdates(
  blocks: BlockRecord[],
  collapsed: boolean,
): { id: string; collapsed: boolean }[] {
  return toggleBlocks(blocks)
    .filter((b) => !!b.collapsed !== collapsed)
    .map((b) => ({ id: b.id, collapsed }));
}
