import { useState } from 'react';
import { formatDate } from './dateFormat';

/** Today as ISO YYYY-MM-DD. Reads the wall clock, so it lives here (not in the
 * pure formatter) — the relative format needs a reference "now". */
function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** A date cell that shows its formatted value (e.g. "Jan 5, 2026" or "in 3
 * days") when idle and swaps to a native date input for editing. The stored
 * value stays ISO; formatting is presentational. Render-only. */
export function DateCell({
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

  // ISO format (or while editing, or an empty cell) is the native date input.
  if (editing || !format || format === 'iso' || value === '') {
    return (
      <input
        type="date"
        aria-label={label}
        value={value}
        autoFocus={editing}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
      />
    );
  }

  // Idle + formatted: a read-only text field that enters edit mode on focus.
  return (
    <input
      type="text"
      readOnly
      aria-label={label}
      className="pv-date-formatted"
      value={formatDate(value, format, todayIso())}
      onFocus={() => setEditing(true)}
      onMouseDown={(e) => {
        e.preventDefault();
        setEditing(true);
      }}
    />
  );
}
