import { useEffect, useState } from 'react';

/** The phone breakpoint — must match the `max-width: 640px` in Workspace.css so
 * the JS drawer behavior and the CSS layout switch together. */
export const MOBILE_QUERY = '(max-width: 640px)';

/** Reactive "is this a phone-width viewport?" via matchMedia. Updates on resize/
 * orientation change so the drawer vs. persistent-sidebar behavior follows the
 * viewport. SSR/no-matchMedia environments default to false (desktop). */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(MOBILE_QUERY).matches === true,
  );

  useEffect(() => {
    const mq = window.matchMedia?.(MOBILE_QUERY);
    if (!mq) return;
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
