import type { TableColumn } from '../../lib/pbTypes';
import { MultiSelectCell } from './MultiSelectCell';
import { SelectCell } from './SelectCell';

/** Dispatches a `select` / `multiselect` cell to the matching picker. Both take
 * the same option-management props (add / remove / rename an option), so grouping
 * them here keeps TableCell's dispatch small. Render-only. */
export function ChoiceCell({
  column,
  value,
  label,
  onChange,
  onAddOption,
  onRemoveOption,
  onRenameOption,
}: {
  column: TableColumn;
  value: string;
  label: string;
  onChange: (value: string) => void;
  onAddOption: (option: string) => void;
  onRemoveOption: (option: string) => void;
  onRenameOption: (from: string, to: string) => void;
}) {
  const Cell = column.type === 'multiselect' ? MultiSelectCell : SelectCell;
  return (
    <Cell
      value={value}
      options={column.options ?? []}
      label={label}
      onChange={onChange}
      onAddOption={onAddOption}
      onRemoveOption={onRemoveOption}
      onRenameOption={onRenameOption}
    />
  );
}
