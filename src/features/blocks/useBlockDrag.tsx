import type { DragEvent } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { cycleType } from './blockText';
import { colorClass } from './blockColors';
import type { BlockDndHandlers } from './BlockRow';

/**
 * The drag-and-drop wiring for one block row: the wrapper class (with drag/over
 * state), the row's drop-target handlers, and the ⋮⋮ handle element (drag to
 * reorder, click to cycle type). Keeps BlockRow render-only and under length.
 */
export function useBlockDrag(
  block: BlockRecord,
  onEdit: (id: string, patch: Partial<BlockRecord>) => void,
  dnd: BlockDndHandlers,
) {
  const tint = colorClass(block.color);
  const cls =
    `pv-block pv-block--${block.type}` +
    (tint ? ` ${tint}` : '') +
    (dnd.draggingId === block.id ? ' pv-block--dragging' : '') +
    (dnd.overId === block.id && dnd.draggingId !== block.id ? ' pv-block--over' : '');

  const rowDrag = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      dnd.onDragOver(block.id);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      dnd.onDrop(block.id);
    },
    onDragEnd: dnd.onDragEnd,
  };

  const handle = (
    <button
      className="pv-block-style"
      aria-label="Drag to reorder or click to change block type"
      draggable
      onDragStart={() => dnd.onDragStart(block.id)}
      onClick={() => onEdit(block.id, { type: cycleType(block.type) })}
    >
      ⋮⋮
    </button>
  );

  return { cls, rowDrag, handle };
}
