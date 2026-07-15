import type { ClipboardEvent } from 'react';
import type { TableColumn } from '../../lib/pbTypes';
import { RelationCell } from './RelationCell';
import { NumberCell } from './NumberCell';
import { DateCell } from './DateCell';
import { ChoiceCell } from './ChoiceCell';

/** One table body cell, rendered by its column type. Value is always a string;
 * checkbox uses 'true'/'', select holds one option, relation holds a page id.
 * Render-only — edits bubble up via onChange. */
export function TableCell({
  column,
  value,
  label,
  onChange,
  onAddOption,
  onRemoveOption,
  onRenameOption,
  onPasteGrid,
}: {
  column: TableColumn;
  value: string;
  label: string;
  onChange: (value: string) => void;
  /** Create a new (multi)select option inline and assign it to this cell. */
  onAddOption: (option: string) => void;
  /** Remove a (multi)select option from the column (and strip it from cells). */
  onRemoveOption: (option: string) => void;
  /** Rename a (multi)select option (updating the column + every cell). */
  onRenameOption: (from: string, to: string) => void;
  /** Spread pasted spreadsheet/TSV text across cells from here; true if handled. */
  onPasteGrid: (text: string) => boolean;
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

  if (column.type === 'select' || column.type === 'multiselect') {
    return (
      <ChoiceCell
        column={column}
        value={value}
        label={label}
        onChange={onChange}
        onAddOption={onAddOption}
        onRemoveOption={onRemoveOption}
        onRenameOption={onRenameOption}
      />
    );
  }

  if (column.type === 'number') {
    return <NumberCell value={value} format={column.format} label={label} onChange={onChange} />;
  }

  // Spread a pasted spreadsheet/TSV grid across cells; if it wasn't a grid,
  // let the browser paste the text into this one cell as usual.
  const onPaste = (e: ClipboardEvent) => {
    if (onPasteGrid(e.clipboardData.getData('text/plain'))) e.preventDefault();
  };

  if (column.wrap) {
    return (
      <textarea
        className="pv-table-wrapcell"
        rows={1}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPaste={onPaste}
      />
    );
  }

  return (
    <input
      type="text"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onPaste={onPaste}
    />
  );
}
