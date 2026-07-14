import { useEffect, type RefObject } from 'react';

/** When `active` becomes true, focus the ref'd element once and fire `onDone`.
 * Used to move the caret into a block just created by Enter, or the block a
 * Backspace-merge joined into. When `caret` is given, the cursor is placed there
 * (the merge join point); otherwise the browser's default (end) applies. */
export function useAutoFocus(
  active: boolean | undefined,
  ref: RefObject<HTMLTextAreaElement | null>,
  onDone?: () => void,
  caret?: number,
) {
  useEffect(() => {
    if (active && ref.current) {
      const el = ref.current;
      el.focus();
      if (caret != null) el.setSelectionRange(caret, caret);
      onDone?.();
    }
  }, [active, onDone, ref, caret]);
}
