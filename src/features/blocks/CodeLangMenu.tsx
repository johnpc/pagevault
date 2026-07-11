import { useState } from 'react';
import { CODE_LANGS, codeLangLabel } from './codeLangs';

/** A small popover on a code block that labels + picks its language. The label
 * button shows the current language; the list sets a new one. Mirrors
 * ColorMenu's open/pick shape. */
export function CodeLangMenu({
  current,
  onPick,
}: {
  current: string;
  onPick: (token: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="pv-codelang">
      <button
        className="pv-codelang-btn"
        aria-label="Code language"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {codeLangLabel(current)}
      </button>
      {open && (
        <ul className="pv-codelang-menu" role="listbox" aria-label="Code language">
          {CODE_LANGS.map((l) => (
            <li key={l.token || 'plain'}>
              <button
                type="button"
                role="option"
                aria-selected={l.token === current}
                className={`pv-codelang-item${l.token === current ? ' pv-codelang-item--on' : ''}`}
                onClick={() => {
                  onPick(l.token);
                  setOpen(false);
                }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
