import { selectedValues, isSelected, toggleValue } from './multiSelect';
import { usePopover } from '../shell/usePopover';
import { Tag } from './Tag';
import { OptionRow } from './OptionRow';
import { OptionAddBox } from './OptionAddBox';
import { useOptionPicker } from './useOptionPicker';

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
  onRemoveOption,
  onRenameOption,
}: {
  value: string;
  options: string[];
  label: string;
  onChange: (value: string) => void;
  onAddOption: (option: string) => void;
  onRemoveOption: (option: string) => void;
  onRenameOption: (from: string, to: string) => void;
}) {
  const { open, setOpen, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();
  const picker = useOptionPicker(options, onAddOption);
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
        {chosen.length ? chosen.map((v) => <Tag key={v} label={v} />) : '—'}
      </button>
      {open && (
        <ul ref={menuRef} className="pv-multiselect-menu" aria-label={`${label} options`}>
          {picker.filtered.map((opt) => (
            <OptionRow
              key={opt}
              option={opt}
              onRename={(to) => onRenameOption(opt, to)}
              onRemove={() => onRemoveOption(opt)}
            >
              <label>
                <input
                  type="checkbox"
                  checked={isSelected(value, opt)}
                  onChange={() => onChange(toggleValue(value, opt, options))}
                />
                <Tag label={opt} />
              </label>
            </OptionRow>
          ))}
          <OptionAddBox label={label} picker={picker} />
        </ul>
      )}
    </div>
  );
}
