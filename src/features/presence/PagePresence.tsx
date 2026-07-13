import { usePresenceViewers } from './usePresence';
import { PresenceAvatars } from './PresenceAvatars';

/** The header avatar stack of everyone else viewing the page. Reads the shared
 * PresenceProvider (which owns the heartbeat); pageId is accepted for a stable
 * call site but the provider is what's scoped to the page. */
export function PagePresence({ pageId }: { pageId: string }) {
  void pageId;
  const viewers = usePresenceViewers();
  return <PresenceAvatars viewers={viewers} />;
}
