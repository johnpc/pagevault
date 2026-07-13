import type { TableColumn } from '../../lib/pbTypes';

/** One table body cell, rendered by its column type. Value is always a string;
 * checkbox uses 'true'/'', select holds one option. Render-only — edits bubble
 * up via onChange. */
export function TableCell({
  column,
  value,
  label,
  onChange,
}: {
  column: TableColumn;
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
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
    return (
      <input
        type="date"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
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

  return (
    <input
      type={column.type === 'number' ? 'number' : 'text'}
      inputMode={column.type === 'number' ? 'decimal' : undefined}
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
