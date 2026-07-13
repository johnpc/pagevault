import { CODE_LANGS, codeLangLabel } from './codeLangs';
import { usePopover } from '../shell/usePopover';

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
  const { open, setOpen, close, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();

  return (
    <div className="pv-codelang" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-codelang-btn"
        aria-label="Code language"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {codeLangLabel(current)}
      </button>
      {open && (
        <ul ref={menuRef} className="pv-codelang-menu" role="listbox" aria-label="Code language">
          {CODE_LANGS.map((l) => (
            <li key={l.token || 'plain'}>
              <button
                type="button"
                role="option"
                aria-selected={l.token === current}
                className={`pv-codelang-item${l.token === current ? ' pv-codelang-item--on' : ''}`}
                onClick={() => {
                  onPick(l.token);
                  close();
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
