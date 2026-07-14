import { TOOLBAR_ACTIONS } from './selectionFormat';

/** The floating format toolbar shown above a text selection. Buttons use
 * onMouseDown + preventDefault so clicking never blurs the textarea (which would
 * drop the selection before the format applies). Positioned fixed at `anchor`,
 * horizontally centered and lifted above the line. Hidden when anchor is null. */
export function SelectionToolbar({
  anchor,
  onApply,
}: {
  anchor: { top: number; left: number } | null;
  onApply: (marker: string) => void;
}) {
  if (!anchor) return null;
  return (
    <div
      className="pv-seltoolbar"
      role="toolbar"
      aria-label="Format selection"
      style={{ top: anchor.top, left: anchor.left }}
    >
      {TOOLBAR_ACTIONS.map((a) => (
        <button
          key={a.key}
          type="button"
          className={`pv-seltoolbar-btn pv-seltoolbar-btn--${a.key}`}
          aria-label={a.title}
          title={a.title}
          onMouseDown={(e) => {
            e.preventDefault();
            if (a.marker) onApply(a.marker);
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
