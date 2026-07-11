import { useEffect, useState } from 'react';
import { isTypingTarget } from './shortcuts';

/**
 * Open/close state for the shortcut-help overlay. Opens on "?" (only when not
 * typing in a field), closes on Escape or "?" again. View-agnostic.
 */
export function useShortcutHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !isTypingTarget(e.target)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return { open, setOpen };
}
