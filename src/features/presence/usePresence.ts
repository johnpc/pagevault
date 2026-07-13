import { useContext } from 'react';
import { PresenceContext } from './PresenceContext';
import type { Viewer, ViewerAt } from './activeViewers';

/** The other people currently viewing the page (for the header avatar stack). */
export function usePresenceViewers(): Viewer[] {
  return useContext(PresenceContext).viewers;
}

/** The live cursors on a given block: the other viewers focused there (empty
 * when none). Used by each block row to render collaborator name-tags. */
export function useBlockCursors(blockId: string): ViewerAt[] {
  return useContext(PresenceContext).cursors[blockId] ?? [];
}

/** The setter the editor calls when focus moves to a block, so collaborators
 * see this user's cursor there. */
export function useSetFocusedBlock(): (blockId: string) => void {
  return useContext(PresenceContext).setFocusedBlock;
}
