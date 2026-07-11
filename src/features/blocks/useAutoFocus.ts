import { useEffect, type RefObject } from 'react';

/** When `active` becomes true, focus the ref'd element once and fire `onDone`.
 * Used to move the caret into a block just created by Enter. */
export function useAutoFocus(
  active: boolean | undefined,
  ref: RefObject<HTMLTextAreaElement | null>,
  onDone?: () => void,
) {
  useEffect(() => {
    if (active && ref.current) {
      ref.current.focus();
      onDone?.();
    }
  }, [active, onDone, ref]);
}
