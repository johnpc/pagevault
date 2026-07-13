import { useState } from 'react';
import { formatNumber } from './numberFormat';

/** A number cell that shows its formatted value (e.g. "$1,000") when idle and
 * swaps to a raw numeric input for editing — so the stored plain string is what
 * you type, but the display honors the column's format. Render-only. */
export function NumberCell({
  value,
  format,
  label,
  onChange,
}: {
  value: string;
  format: string | undefined;
  label: string;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const formatted = formatNumber(value, format);

  // Plain format (or while editing) is just the raw numeric input.
  if (editing || !format || format === 'plain') {
    return (
      <input
        type="number"
        inputMode="decimal"
        aria-label={label}
        value={value}
        autoFocus={editing}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
      />
    );
  }

  // Idle + formatted: a read-only text button that enters edit mode on focus.
  return (
    <input
      type="text"
      readOnly
      aria-label={label}
      className="pv-number-formatted"
      value={formatted}
      onFocus={() => setEditing(true)}
      onMouseDown={(e) => {
        e.preventDefault();
        setEditing(true);
      }}
    />
  );
}
