/** The floating "show sidebar" button, rendered only while the sidebar is
 * hidden (Cmd/Ctrl+\). Kept as its own component so Workspace stays a flat
 * shell. Renders nothing when the sidebar is shown. */
export function SidebarShowButton({ hidden, onShow }: { hidden: boolean; onShow: () => void }) {
  if (!hidden) return null;
  return (
    <button
      className="pv-sidebar-show"
      aria-label="Show sidebar"
      title="Show sidebar (⌘\)"
      onClick={onShow}
    >
      ☰
    </button>
  );
}
