import { useState } from 'react';
import type { PageRecord } from '../../lib/pbClient';
import { useSetShared } from './sharingApi';
import { shareUrl } from './sharing';

/** Toggle public sharing for a page and copy its /shared/<token> link. */
export function ShareButton({ page }: { page: PageRecord }) {
  const setShared = useSetShared();
  const [copied, setCopied] = useState(false);

  const enable = async () => {
    const updated = await setShared.mutateAsync({ page, isPublic: true });
    const url = shareUrl(window.location.origin, updated.shareToken);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the link is still live at the shown URL */
    }
  };

  if (!page.isPublic) {
    return (
      <button className="pv-page-delete pv-muted" onClick={enable} disabled={setShared.isPending}>
        Share
      </button>
    );
  }

  return (
    <span className="pv-share-on">
      <button
        className="pv-page-delete"
        aria-label="Copy share link"
        onClick={() => {
          navigator.clipboard?.writeText(shareUrl(window.location.origin, page.shareToken));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? '✓ Link copied' : '🔗 Copy link'}
      </button>
      <button
        className="pv-page-delete pv-muted"
        onClick={() => setShared.mutate({ page, isPublic: false })}
      >
        Unshare
      </button>
    </span>
  );
}
