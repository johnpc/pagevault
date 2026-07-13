import { useEffect, useState } from 'react';

/**
 * Sidebar show/hide state plus the global Cmd/Ctrl+\ shortcut (Notion's sidebar
 * toggle). View-agnostic so the shell stays render-only. Starts shown.
 */
export function useSidebarToggle() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setHidden((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return { hidden, setHidden };
}

/** The workspace container class for a given sidebar-hidden state. Pure. */
export function workspaceClass(hidden: boolean): string {
  return `pv-workspace${hidden ? ' pv-workspace--sidebar-hidden' : ''}`;
}
