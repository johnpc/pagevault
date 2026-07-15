import { useState } from 'react';
import { usePopover } from '../shell/usePopover';
import { Tag } from './Tag';

/** A single-select cell: a summary button that opens the column's options as a
 * radio list (picking one sets the cell; picking the chosen one clears it). A
 * text input at the bottom creates a new option inline (Enter) and assigns it —
 * the Notion gesture. Focus-trapped + Escape/outside-click via usePopover. */
export function SelectCell({
  value,
  options,
  label,
  onChange,
  onAddOption,
  onRemoveOption,
}: {
  value: string;
  options: string[];
  label: string;
  onChange: (value: string) => void;
  onAddOption: (option: string) => void;
  onRemoveOption: (option: string) => void;
}) {
  const { open, setOpen, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();
  const [draft, setDraft] = useState('');

  const add = () => {
    const opt = draft.trim();
    if (!opt || options.includes(opt)) return;
    onAddOption(opt);
    setDraft('');
  };

  return (
    <div className="pv-multiselect" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-multiselect-btn"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {value ? <Tag label={value} /> : '—'}
      </button>
      {open && (
        <ul ref={menuRef} className="pv-multiselect-menu" aria-label={`${label} options`}>
          {options.map((opt) => (
            <li key={opt} className="pv-opt-row">
              <button
                type="button"
                className={`pv-select-opt${opt === value ? ' pv-select-opt--on' : ''}`}
                aria-pressed={opt === value}
                onClick={() => onChange(opt === value ? '' : opt)}
              >
                <Tag label={opt} />
              </button>
              <button
                type="button"
                className="pv-opt-remove"
                aria-label={`Remove option ${opt}`}
                onClick={() => onRemoveOption(opt)}
              >
                ✕
              </button>
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
