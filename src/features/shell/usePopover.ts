import { useCallback, useEffect, useRef, useState } from 'react';
import { focusables, nextFocus } from './focusTrap';

/**
 * A11y behavior shared by every popover menu (color, turn-into, callout icon,
 * code language, properties…): Escape closes and returns focus to the trigger,
 * a click/focus outside closes, and while open, focus is trapped inside the menu
 * (Tab / Shift+Tab cycle, first item focused on open). Returns the open state, a
 * setter, and refs to spread onto the trigger button and the menu container.
 */
export function usePopover<T extends HTMLElement = HTMLElement>() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<T>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Focus the first focusable in the menu when it opens.
  useEffect(() => {
    if (open) focusables(menuRef.current)[0]?.focus();
  }, [open]);

  // Close on an outside pointer-down (capture, so it beats inner handlers).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown, true);
    return () => document.removeEventListener('pointerdown', onDown, true);
  }, [open]);

  // Escape closes (refocusing the trigger); Tab is trapped within the menu.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      } else if (e.key === 'Tab') {
        const target = nextFocus(focusables(menuRef.current), document.activeElement, e.shiftKey);
        if (target) {
          e.preventDefault();
          target.focus();
        }
      }
    },
    [close],
  );

  return { open, setOpen, close, triggerRef, menuRef, onKeyDown };
}
