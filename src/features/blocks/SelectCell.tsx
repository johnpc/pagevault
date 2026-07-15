import { usePopover } from '../shell/usePopover';
import { Tag } from './Tag';
import { OptionRow } from './OptionRow';
import { OptionAddBox } from './OptionAddBox';
import { useOptionPicker } from './useOptionPicker';

/** A single-select cell: a summary button that opens the column's options as a
 * radio list (picking one sets the cell; picking the chosen one clears it). The
 * box at the bottom filters options as you type and creates a new one (Enter)
 * when nothing matches — the Notion gesture. Focus-trapped via usePopover. */
export function SelectCell({
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
          {picker.filtered.map((opt) => (
            <OptionRow
              key={opt}
              option={opt}
              onRename={(to) => onRenameOption(opt, to)}
              onRemove={() => onRemoveOption(opt)}
            >
              <button
                type="button"
                className={`pv-select-opt${opt === value ? ' pv-select-opt--on' : ''}`}
                aria-pressed={opt === value}
                onClick={() => onChange(opt === value ? '' : opt)}
              >
                <Tag label={opt} />
              </button>
            </OptionRow>
          ))}
          <OptionAddBox label={label} picker={picker} />
        </ul>
      )}
    </div>
  );
}
