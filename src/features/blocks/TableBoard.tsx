import { useState, type DragEvent } from 'react';
import type { TableData } from '../../lib/pbTypes';
import { setCell, addRow } from './tableData';
import { groupRows, moveRowToGroup, boardGroupColumn } from './tableGroups';
import { usePointerDrag } from './usePointerDrag';

/** The kanban board view of a table: rows grouped into columns by a `select`
 * column. Drag a card to another column to change its group; the card's title
 * is the first non-group column. Render-only; edits patch via `save`. */
export function TableBoard({ data, save }: { data: TableData; save: (next: TableData) => void }) {
  const gcol = boardGroupColumn(data);
  const [drag, setDrag] = useState<number | null>(null);
  const groups = groupRows(data, gcol);
  // The column shown as a card's title: the first column that isn't the group.
  const titleCol = data.columns.findIndex((_, i) => i !== gcol);

  const dropOn = (value: string) => {
    setDrag((from) => {
      if (from !== null) save(moveRowToGroup(data, from, gcol, value));
      return null;
    });
  };
  // Touch/pen: the card grip starts the drag (row index); a column carries
  // data-drag-id={group value}, so releasing over it moves the card there.
  const pointer = usePointerDrag({
    onDragStart: (id) => setDrag(Number(id)),
    onDragOver: () => {},
    onDrop: (value) => dropOn(value),
    onDragEnd: () => setDrag(null),
  });

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
          data-drag-id={g.value}
          onDragOver={(e: DragEvent) => e.preventDefault()}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            dropOn(g.value);
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
              <button
                className="pv-board-grip"
                aria-label={`Drag card ${r + 1}`}
                onPointerDown={pointer.onPointerDown(String(r))}
              >
                ⋮⋮
              </button>
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
