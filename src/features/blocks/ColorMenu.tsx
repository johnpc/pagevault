import { useState } from 'react';
import { BLOCK_COLORS } from './blockColors';

/** A small color-picker popover for a block: a paint button that opens a grid of
 * text + background swatches. Choosing one sets the block's `color` token. */
export function ColorMenu({
  current,
  onPick,
}: {
  current: string;
  onPick: (token: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pv-color">
      <button
        className="pv-block-dup"
        aria-label="Block color"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        🎨
      </button>
      {open && (
        <ul className="pv-color-menu" role="listbox" aria-label="Block color">
          {BLOCK_COLORS.map((c) => (
            <li key={c.token || 'default'}>
              <button
                type="button"
                role="option"
                aria-selected={c.token === current}
                className={`pv-color-item pv-color--${c.token || 'default'}${
                  c.token === current ? ' pv-color-item--on' : ''
                }`}
                onClick={() => {
                  onPick(c.token);
                  setOpen(false);
                }}
              >
                <span className="pv-color-swatch" aria-hidden="true">
                  {c.swatch}
                </span>
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
