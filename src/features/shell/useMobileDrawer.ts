import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { focusables, nextFocus } from './focusTrap';

/**
 * Drawer state for the mobile sidebar: open/close, auto-close on navigation
 * (tapping a page closes the drawer), Escape to close, and a focus trap while
 * open (Tab/Shift+Tab cycle inside; first focusable focused on open; focus
 * returns to the opener on close). Only active when `enabled` (phone width);
 * on desktop the sidebar is persistent so the trap/handlers stay off.
 */
export function useMobileDrawer(enabled: boolean) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // Close whenever the route changes (a page/sub-page was opened).
  useEffect(() => setOpen(false), [pathname]);

  // Force-closed on desktop so switching to a wide viewport can't strand it open.
  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);

  // Focus the first control on open; Escape closes; Tab is trapped in the panel.
  useEffect(() => {
    if (!enabled || !open) return;
    focusables(panelRef.current)[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === 'Tab') {
        const next = nextFocus(focusables(panelRef.current), document.activeElement, e.shiftKey);
        if (next) {
          e.preventDefault();
          next.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enabled, open]);

  return { open, setOpen, panelRef };
}
