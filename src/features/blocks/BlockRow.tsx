import type { BlockRecord } from '../../lib/pbClient';
import { useBlockDrag } from './useBlockDrag';
import { ImageBlock } from './ImageBlock';
import { TextBlockBody } from './TextBlockBody';
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

/** One block row: the drag handle + a type-specific body (divider rule, image,
 * or the editable text body with inline preview + slash menu). */
export function BlockRow({ block, onEdit, onRemove, onEnter, dnd }: BlockRowProps) {
  const { cls, rowDrag, handle } = useBlockDrag(block, onEdit, dnd);

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

  if (block.type === 'image') {
    return (
      <div className={cls} {...rowDrag}>
        {handle}
        <ImageBlock block={block} onEdit={onEdit} />
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
      {block.type === 'callout' && (
        <span className="pv-callout-icon" aria-hidden="true">
          💡
        </span>
      )}
      <TextBlockBody block={block} onEdit={onEdit} onRemove={onRemove} onEnter={onEnter} />
    </div>
  );
}
