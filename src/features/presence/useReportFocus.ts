import { useSetFocusedBlock } from './usePresence';

/**
 * A focus handler for a block row that reports the caller's cursor position to
 * the shared PresenceProvider, so collaborators see a live cursor on the block
 * this user is editing. Safe to spread onto the row wrapper — focus bubbles from
 * the textarea, and the provider de-dupes redundant sets. We intentionally do
 * NOT clear on blur: moving to another block immediately reports that one (no
 * cursor flash between blocks), and leaving the page clears via the provider's
 * unmount cleanup.
 */
export function useReportFocus(blockId: string) {
  const setFocused = useSetFocusedBlock();
  return { onFocus: () => setFocused(blockId) };
}
