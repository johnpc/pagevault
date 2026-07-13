import { usePresence } from './usePresence';
import { PresenceAvatars } from './PresenceAvatars';

/** Drop-in presence indicator for a page: runs the heartbeat + realtime
 * subscription and renders the avatar stack of everyone else currently viewing.
 * Self-contained so the page header stays render-only. */
export function PagePresence({ pageId }: { pageId: string }) {
  const viewers = usePresence(pageId);
  return <PresenceAvatars viewers={viewers} />;
}
