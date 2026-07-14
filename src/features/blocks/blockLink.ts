import { blockAnchorId } from './tocData';

/**
 * A deep link to a specific block: the page URL plus a `#pv-block-<id>` hash the
 * editor scrolls to + highlights on load. `origin` is the current site origin
 * (injected for testability; trailing slash trimmed). Pure.
 */
export function blockLink(origin: string, pageId: string, blockId: string): string {
  return `${origin.replace(/\/$/, '')}/page/${pageId}#${blockAnchorId(blockId)}`;
}

/** The block id referenced by a URL hash like `#pv-block-abc`, or null. The
 * inverse of blockLink's hash — used to scroll to the linked block. Pure. */
export function blockIdFromHash(hash: string): string | null {
  const m = /^#?pv-block-(.+)$/.exec(hash);
  return m ? m[1] : null;
}
