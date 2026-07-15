import { useState } from 'react';
import { selectedValues, isSelected, toggleValue } from './multiSelect';
import { usePopover } from '../shell/usePopover';

/** A multi-select cell: a chip summary that opens a checklist of the column's
 * options; toggling one adds/removes it from the comma-joined stored value. A
 * text input at the bottom creates a new option inline (Enter) and assigns it —
 * the Notion tagging gesture. Focus-trapped + Escape/outside-click via usePopover. */
export function MultiSelectCell({
  value,
  options,
  label,
  onChange,
  onAddOption,
}: {
  value: string;
  options: string[];
  label: string;
  onChange: (value: string) => void;
  onAddOption: (option: string) => void;
}) {
  const { open, setOpen, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();
  const [draft, setDraft] = useState('');

  const add = () => {
    const opt = draft.trim();
    if (!opt || options.includes(opt)) return;
    onAddOption(opt);
    setDraft('');
  };
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
          <li className="pv-multiselect-add">
            <input
              type="text"
              aria-label={`Add an option to ${label}`}
              placeholder="Add option…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  add();
                }
              }}
            />
          </li>
        </ul>
      )}
    </div>
  );
}
