import { useEffect, type RefObject } from 'react';
import { focusables, nextFocus } from './focusTrap';

/** Trap keyboard focus inside an open modal dialog: while `active`, Tab /
 * Shift+Tab cycle within `ref`'s focusable elements instead of escaping to the
 * page behind it. Reuses the shared focusTrap helpers (also used by the mobile
 * drawer). Escape/outside-click closing is left to the caller. DOM-only. */
export function useDialogFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const next = nextFocus(focusables(ref.current), document.activeElement, e.shiftKey);
      if (next) {
        e.preventDefault();
        next.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ref, active]);
}
