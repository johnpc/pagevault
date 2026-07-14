import type { BlockRecord } from '../../lib/pbClient';

/** The block fields PocketBase needs to recreate a deleted block exactly — the
 * original id and sort included, so restoring puts it back in its old position
 * with all its content/formatting. System fields (created/updated/collection*)
 * are dropped; the server re-stamps them. Pure.
 *
 * Note: an uploaded image's file blob is removed from storage on delete, so a
 * restored image block keeps its record but not the binary — a known edge. */
export function restorePayload(block: BlockRecord): Record<string, unknown> {
  return {
    id: block.id,
    page: block.page,
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
    sort: block.sort,
    owner: block.owner,
  };
}
