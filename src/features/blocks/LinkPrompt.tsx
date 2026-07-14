import { useState } from 'react';

/** The inline URL entry shown when the selection toolbar's link button is
 * clicked. Submitting (Enter or the ✓) calls onSubmit with the url; Escape or
 * the ✕ cancels. onMouseDown is NOT prevented here (the field needs focus), so
 * the parent keeps the toolbar open while this is showing. */
export function LinkPrompt({
  onSubmit,
  onCancel,
}: {
  onSubmit: (url: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState('');
  return (
    <form
      className="pv-seltoolbar-link"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(url);
      }}
    >
      <input
        className="pv-seltoolbar-linkinput"
        aria-label="Link URL"
        placeholder="Paste or type a URL…"
        value={url}
        autoFocus
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      />
      <button type="submit" className="pv-seltoolbar-btn" aria-label="Apply link">
        ✓
      </button>
    </form>
  );
}
