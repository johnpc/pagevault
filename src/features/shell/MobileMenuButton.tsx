/** The floating hamburger that opens the sidebar drawer on phones. Rendered only
 * on mobile (Workspace gates it); CSS hides it ≥ 640px as a belt-and-braces. */
export function MobileMenuButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="pv-mobile-menu" aria-label="Open sidebar" onClick={onOpen}>
      ☰
    </button>
  );
}
