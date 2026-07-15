import { useState } from 'react';
import { TOOLBAR_ACTIONS } from './selectionFormat';
import { LinkPrompt } from './LinkPrompt';

/** The floating format toolbar shown above a text selection. Format buttons use
 * onMouseDown + preventDefault so clicking never blurs the textarea (which would
 * drop the selection before the format applies). The link button reveals an
 * inline URL prompt; submitting wraps the selection as a [text](url) link.
 * Positioned fixed at `anchor`, centered above the line; hidden when null. */
export function SelectionToolbar({
  anchor,
  apply,
  applyLink,
}: {
  anchor: { top: number; left: number } | null;
  apply: (marker: string) => void;
  applyLink: (url: string) => void;
}) {
  const [prompt, setPrompt] = useState(false);
  if (!anchor) return null;
  const style = { top: anchor.top, left: anchor.left };
  if (prompt) {
    return (
      <div className="pv-seltoolbar" role="toolbar" aria-label="Format selection" style={style}>
        <LinkPrompt
          onSubmit={(url) => {
            setPrompt(false);
            applyLink(url);
          }}
          onCancel={() => setPrompt(false)}
        />
      </div>
    );
  }
  return (
    <div className="pv-seltoolbar" role="toolbar" aria-label="Format selection" style={style}>
      {TOOLBAR_ACTIONS.map((a) => (
        <button
          key={a.key}
          type="button"
          className={`pv-seltoolbar-btn pv-seltoolbar-btn--${a.key}`}
          aria-label={a.title}
          title={a.title}
          onMouseDown={(e) => {
            e.preventDefault();
            if (a.marker) apply(a.marker);
          }}
        >
          {a.label}
        </button>
      ))}
      <button
        type="button"
        className="pv-seltoolbar-btn pv-seltoolbar-btn--link"
        aria-label="Link"
        title="Link"
        onMouseDown={(e) => {
          e.preventDefault();
          setPrompt(true);
        }}
      >
        🔗
      </button>
    </div>
  );
}
