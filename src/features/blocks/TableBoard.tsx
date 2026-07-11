import { useState, type DragEvent } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { setCell, addRow } from './tableData';
import { groupRows, moveRowToGroup, boardGroupColumn } from './tableGroups';

/** The kanban board view of a table: rows grouped into columns by a `select`
 * column. Drag a card to another column to change its group; the card's title
 * is the first non-group column. Render-only; edits patch via `save`. */
export function TableBoard({ data, save }: { data: TableData; save: (next: TableData) => void }) {
  const gcol = boardGroupColumn(data);
  const [drag, setDrag] = useState<number | null>(null);
  const groups = groupRows(data, gcol);
  // The column shown as a card's title: the first column that isn't the group.
  const titleCol = data.columns.findIndex((_, i) => i !== gcol);

  const addTo = (value: string) => {
    const withRow = addRow(data);
    save(moveRowToGroup(withRow, withRow.rows.length - 1, gcol, value));
  };

  return (
    <div className="pv-board">
      {groups.map((g) => (
        <div
          key={g.value || '_none'}
          className="pv-board-col"
          onDragOver={(e: DragEvent) => e.preventDefault()}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            if (drag !== null) save(moveRowToGroup(data, drag, gcol, g.value));
            setDrag(null);
          }}
        >
          <div className="pv-board-col-head">
            {g.label} <span className="pv-muted">{g.rows.length}</span>
          </div>
          {g.rows.map((r) => (
            <div
              key={r}
              className={`pv-board-card${drag === r ? ' pv-board-card--dragging' : ''}`}
              draggable
              onDragStart={() => setDrag(r)}
              onDragEnd={() => setDrag(null)}
            >
              <input
                aria-label={`Card ${r + 1}`}
                value={data.rows[r][titleCol] ?? ''}
                onChange={(e) => save(setCell(data, r, titleCol, e.target.value))}
              />
            </div>
          ))}
          <button className="pv-board-add pv-muted" onClick={() => addTo(g.value)}>
            + New
          </button>
        </div>
      ))}
    </div>
  );
}
