import { blockLink } from './blockLink';
import { showToast } from '../shell/toastBus';

/** A block hover action that copies a deep link to this block
 * (…/page/<pageId>#pv-block-<id>) to the clipboard, with a confirming toast.
 * Opening that link scrolls to + flashes the block (see useBlockHashScroll). */
export function CopyLinkButton({ pageId, blockId }: { pageId: string; blockId: string }) {
  const copy = async () => {
    const link = blockLink(window.location.origin, pageId, blockId);
    try {
      await navigator.clipboard.writeText(link);
      showToast('Link to block copied.');
    } catch {
      showToast('Could not copy the link.');
    }
  };

  return (
    <button type="button" className="pv-block-link" aria-label="Copy link to block" onClick={copy}>
      🔗
    </button>
  );
}
