import type { BlockRecord } from '../../lib/pbClient';
import type { ColumnsData } from '../../lib/pbTypes';
import {
  normalizeColumns,
  setColumnText,
  addColumnToLayout,
  removeColumnFromLayout,
} from './columnsData';
import './ColumnsBlock.css';

/** A side-by-side multi-column layout. Each column is a plain-text area; the
 * layout lives in the block's `data` ({ cols }). Render-only — logic is in the
 * pure columnsData helpers. */
export function ColumnsBlock({
  block,
  onEdit,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
}) {
  const data = normalizeColumns(block.data as ColumnsData | null);
  const save = (next: ColumnsData) => onEdit(block.id, { data: next });

  return (
    <div className="pv-columns">
      {data.cols.map((text, c) => (
        <div className="pv-column" key={c}>
          <textarea
            className="pv-block-input"
            aria-label={`Column ${c + 1}`}
            rows={2}
            value={text}
            placeholder="Type here…"
            onChange={(e) => save(setColumnText(data, c, e.target.value))}
          />
          {data.cols.length > 2 && (
            <button
              className="pv-column-del"
              aria-label={`Delete column ${c + 1}`}
              onClick={() => save(removeColumnFromLayout(data, c))}
            >
              ×
            </button>
          )}
        </div>
      ))}
      {data.cols.length < 4 && (
        <button
          className="pv-column-add pv-muted"
          aria-label="Add column"
          onClick={() => save(addColumnToLayout(data))}
        >
          +
        </button>
      )}
    </div>
  );
}
