import type { TableColumn } from '../../lib/pbTypes';
import { RelationCell } from './RelationCell';
import { NumberCell } from './NumberCell';
import { DateCell } from './DateCell';
import { MultiSelectCell } from './MultiSelectCell';

/** One table body cell, rendered by its column type. Value is always a string;
 * checkbox uses 'true'/'', select holds one option, relation holds a page id.
 * Render-only — edits bubble up via onChange. */
export function TableCell({
  column,
  value,
  label,
  onChange,
  onAddOption,
}: {
  column: TableColumn;
  value: string;
  label: string;
  onChange: (value: string) => void;
  /** Create a new (multi)select option inline and assign it to this cell. */
  onAddOption: (option: string) => void;
}) {
  if (column.type === 'relation') {
    return <RelationCell value={value} label={label} onChange={onChange} />;
  }

  if (column.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        aria-label={label}
        checked={value === 'true'}
        onChange={(e) => onChange(e.target.checked ? 'true' : '')}
      />
    );
  }

  if (column.type === 'date') {
    return <DateCell value={value} format={column.format} label={label} onChange={onChange} />;
  }

  if (column.type === 'select') {
    return (
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {(column.options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (column.type === 'multiselect') {
    return (
      <MultiSelectCell
        value={value}
        options={column.options ?? []}
        label={label}
        onChange={onChange}
        onAddOption={onAddOption}
      />
    );
  }

  if (column.type === 'number') {
    return <NumberCell value={value} format={column.format} label={label} onChange={onChange} />;
  }

  if (column.wrap) {
    return (
      <textarea
        className="pv-table-wrapcell"
        rows={1}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type="text"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
