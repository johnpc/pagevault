import { useEffect } from 'react';
import { blockIdFromHash } from '../blocks/blockLink';
import { blockAnchorId } from '../blocks/tocData';

/**
 * When the page URL carries a `#pv-block-<id>` hash (a copied block link),
 * scroll that block into view and briefly highlight it, once the blocks are
 * present. `ready` gates the scroll until the block list has rendered (so the
 * element exists). Re-runs if the hash or ready-state changes. The highlight is
 * a transient CSS class removed after the animation. No-op without a matching
 * block hash.
 */
export function useBlockHashScroll(hash: string, ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    const blockId = blockIdFromHash(hash);
    if (!blockId) return;
    const el = document.getElementById(blockAnchorId(blockId));
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('pv-block-flash');
    const t = setTimeout(() => el.classList.remove('pv-block-flash'), 1600);
    return () => clearTimeout(t);
  }, [hash, ready]);
}
