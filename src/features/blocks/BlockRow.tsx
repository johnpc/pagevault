import type { DragEvent } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { placeholderFor, cycleType } from './blockText';
import { useBlockInput } from './useBlockInput';
import './BlockRow.css';

export interface BlockDndHandlers {
  draggingId: string | null;
  overId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
  onDragEnd: () => void;
}

interface BlockRowProps {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onEnter: () => void;
  dnd: BlockDndHandlers;
}

/** One editable content block. A divider renders a rule; everything else is a
 * growing textarea. The ⋮⋮ handle drags to reorder; clicking it cycles type. */
export function BlockRow({ block, onEdit, onRemove, onEnter, dnd }: BlockRowProps) {
  const { value, change, keyDown, save } = useBlockInput(block, onEdit, onRemove, onEnter);

  const cls =
    `pv-block pv-block--${block.type}` +
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

  if (block.type === 'divider') {
    return (
      <div className={cls} {...rowDrag}>
        {handle}
        <hr />
        <button
          className="pv-block-del"
          aria-label="Delete block"
          onClick={() => onRemove(block.id)}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className={cls} {...rowDrag}>
      {block.type === 'todo' && (
        <input
          type="checkbox"
          aria-label="Toggle to-do"
          checked={block.checked}
          onChange={(e) => onEdit(block.id, { checked: e.target.checked })}
        />
      )}
      {handle}
      <textarea
        className="pv-block-input"
        aria-label="Block content"
        rows={1}
        value={value}
        placeholder={placeholderFor(block.type)}
        onChange={change}
        onBlur={save}
        onKeyDown={keyDown}
      />
    </div>
  );
}
