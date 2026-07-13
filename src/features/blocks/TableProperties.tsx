import type { TableData } from '../../lib/pbTypes';
import { toggleColumnHidden } from './tableColumns';
import { usePopover } from '../shell/usePopover';

/** A "Properties" popover listing every column with a show/hide checkbox
 * (Notion's property visibility control). Lets hidden columns be brought back —
 * they have no header while hidden, so this is the only way to restore them. */
export function TableProperties({
  data,
  save,
}: {
  data: TableData;
  save: (next: TableData) => void;
}) {
  const { open, setOpen, triggerRef, menuRef, onKeyDown } = usePopover<HTMLUListElement>();
  const hiddenCount = data.columns.filter((c) => c.hidden).length;

  return (
    <div className="pv-table-props" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        className="pv-table-props-btn"
        aria-label="Table properties"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        ☰ Properties{hiddenCount ? ` (${hiddenCount} hidden)` : ''}
      </button>
      {open && (
        <ul ref={menuRef} className="pv-table-props-menu" aria-label="Column visibility">
          {data.columns.map((col, c) => (
            <li key={c}>
              <label>
                <input
                  type="checkbox"
                  aria-label={`Show column ${c + 1}`}
                  checked={!col.hidden}
                  onChange={(e) => save(toggleColumnHidden(data, c, !e.target.checked))}
                />
                {col.name || `Column ${c + 1}`}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
