import { ALIGNMENTS } from './blockAlign';
import { usePopover } from '../shell/usePopover';

/** A small text-alignment popover for a block: a button that opens Left / Center
 * / Right options (Notion's block alignment). Choosing one sets the block's
 * `align` token. Focus-trapped + closes on Escape/outside-click via usePopover. */
export function AlignMenu({
  current,
  onPick,
}: {
  current: string;
  onPick: (token: string) => void;
}) {
  const { open, setOpen, close, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();

  return (
    <div className="pv-align" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-block-dup"
        aria-label="Text alignment"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        ⬌
      </button>
      {open && (
        <ul ref={menuRef} className="pv-align-menu" role="listbox" aria-label="Text alignment">
          {ALIGNMENTS.map((a) => (
            <li key={a.token || 'left'}>
              <button
                type="button"
                role="option"
                aria-selected={a.token === (current ?? '')}
                className={`pv-align-item${a.token === (current ?? '') ? ' pv-align-item--on' : ''}`}
                onClick={() => {
                  onPick(a.token);
                  close();
                }}
              >
                <span aria-hidden="true">{a.glyph}</span> {a.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
