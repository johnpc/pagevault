import { PAGE_FONTS, pageFontLabel } from './pageFont';
import { usePopover } from '../shell/usePopover';

/** A popover in the page actions row that picks the page's typeface (Notion's
 * "Style"). The button shows the current font; the list sets a new one. */
export function FontPicker({
  current,
  onPick,
}: {
  current: string;
  onPick: (token: string) => void;
}) {
  const { open, setOpen, close, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();
  // '' and 'default' are the same default font; normalize for the selected mark.
  const active = current || 'default';

  return (
    <div className="pv-font" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-page-delete pv-muted"
        aria-label="Page font"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {`🆎 ${pageFontLabel(current)}`}
      </button>
      {open && (
        <ul ref={menuRef} className="pv-font-menu" role="listbox" aria-label="Page font">
          {PAGE_FONTS.map((f) => (
            <li key={f.token}>
              <button
                type="button"
                role="option"
                aria-selected={f.token === active}
                className={`pv-font-item${f.token === active ? ' pv-font-item--on' : ''} ${f.cls}`}
                onClick={() => {
                  onPick(f.token);
                  close();
                }}
              >
                {f.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
