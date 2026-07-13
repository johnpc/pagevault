import { selectedValues, isSelected, toggleValue } from './multiSelect';
import { usePopover } from '../shell/usePopover';

/** A multi-select cell: a chip summary that opens a checklist of the column's
 * options; toggling one adds/removes it from the comma-joined stored value.
 * Focus-trapped + closes on Escape/outside-click via usePopover. Render-only. */
export function MultiSelectCell({
  value,
  options,
  label,
  onChange,
}: {
  value: string;
  options: string[];
  label: string;
  onChange: (value: string) => void;
}) {
  const { open, setOpen, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();
  const chosen = selectedValues(value);

  return (
    <div className="pv-multiselect" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-multiselect-btn"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {chosen.length ? chosen.join(', ') : '—'}
      </button>
      {open && (
        <ul ref={menuRef} className="pv-multiselect-menu" aria-label={`${label} options`}>
          {options.map((opt) => (
            <li key={opt}>
              <label>
                <input
                  type="checkbox"
                  checked={isSelected(value, opt)}
                  onChange={() => onChange(toggleValue(value, opt, options))}
                />
                {opt}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
