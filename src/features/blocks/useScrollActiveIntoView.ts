import { useEffect, useRef } from 'react';

/**
 * Keep the active option of a scrollable popup menu (slash / mention) visible as
 * the keyboard highlight moves: when `active` changes, scroll the ref'd element
 * into view within its scroll container (nearest edge, no page jump). Returns a
 * ref to attach to the active item. `scrollIntoView` is undefined in jsdom, so
 * the call is guarded — this is a progressive enhancement, not a hard dep.
 */
export function useScrollActiveIntoView<T extends HTMLElement>(active: number) {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.scrollIntoView?.({ block: 'nearest' });
  }, [active]);
  return ref;
}
