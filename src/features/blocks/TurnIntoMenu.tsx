import type { BlockType } from '../../lib/pbTypes';
import { TURN_INTO_TYPES } from './turnInto';
import { usePopover } from '../shell/usePopover';

/** A popover that converts an existing block to another text-body type, keeping
 * its content (Notion's "Turn into"). Mirrors ColorMenu's open/pick shape. */
export function TurnIntoMenu({
  current,
  onPick,
}: {
  current: BlockType;
  onPick: (type: BlockType) => void;
}) {
  const { open, setOpen, close, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();

  return (
    <div className="pv-turn" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-block-dup"
        aria-label="Turn into"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        ⇄
      </button>
      {open && (
        <ul ref={menuRef} className="pv-turn-menu" role="listbox" aria-label="Turn into">
          {TURN_INTO_TYPES.map((c) => (
            <li key={c.type}>
              <button
                type="button"
                role="option"
                aria-selected={c.type === current}
                className={`pv-turn-item${c.type === current ? ' pv-turn-item--on' : ''}`}
                onClick={() => {
                  onPick(c.type);
                  close();
                }}
              >
                <span className="pv-turn-icon" aria-hidden="true">
                  {c.icon}
                </span>
                <span>{c.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
