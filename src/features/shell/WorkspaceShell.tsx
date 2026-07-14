import type { ReactNode } from 'react';
import { Sidebar } from '../pages/Sidebar';
import { useSidebarToggle, workspaceClass } from './useSidebarToggle';
import { SidebarShowButton } from './SidebarShowButton';
import { MobileMenuButton } from './MobileMenuButton';
import { useIsMobile } from './useIsMobile';
import { useMobileDrawer } from './useMobileDrawer';

/**
 * The workspace frame: the sidebar + routed content. On desktop the sidebar is
 * persistent (Cmd/Ctrl+\ hides it). On phones it's an off-canvas drawer opened
 * by a hamburger, with a backdrop, Escape/tap-to-close, auto-close on navigation
 * (see useMobileDrawer), and a focus trap — the sidebar no longer squeezes the
 * reading column into a cramped rail.
 */
export function WorkspaceShell({
  children,
  onSearch,
  onHelp,
}: {
  children: ReactNode;
  onSearch: () => void;
  onHelp: () => void;
}) {
  const isMobile = useIsMobile();
  const sidebar = useSidebarToggle();
  const drawer = useMobileDrawer(isMobile);

  if (isMobile) {
    return (
      <div className={`pv-workspace pv-workspace--mobile${drawer.open ? ' pv-drawer-open' : ''}`}>
        <MobileMenuButton onOpen={() => drawer.setOpen(true)} />
        {drawer.open && (
          <div className="pv-drawer-backdrop" onClick={() => drawer.setOpen(false)} />
        )}
        <Sidebar ref={drawer.panelRef} onSearch={onSearch} onHelp={onHelp} />
        <div className="pv-workspace-content">{children}</div>
      </div>
    );
  }

  return (
    <div className={workspaceClass(sidebar.hidden)}>
      <SidebarShowButton hidden={sidebar.hidden} onShow={() => sidebar.setHidden(false)} />
      <Sidebar onSearch={onSearch} onHelp={onHelp} />
      <div className="pv-workspace-content">{children}</div>
    </div>
  );
}
