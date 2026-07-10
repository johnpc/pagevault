import { useEffect, useState } from 'react';

/**
 * Quick-find open/close state plus the global Cmd/Ctrl-K shortcut. Escape and
 * navigating away close it. View-agnostic so QuickFind stays render-only.
 */
export function useQuickFind() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
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
