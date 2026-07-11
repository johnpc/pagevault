import type { BlockRecord } from '../../lib/pbClient';
import { useBlockDrag } from './useBlockDrag';
import { ImageBlock } from './ImageBlock';
import { TextBlockBody } from './TextBlockBody';
import { BlockControls } from './BlockControls';
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
  onDuplicate: (block: BlockRecord) => void;
  onIndent: (id: string, dir: 'in' | 'out') => void;
  onEnter: () => void;
  dnd: BlockDndHandlers;
}

/** One block row: the drag handle + a type-specific body (divider rule, image,
 * or the editable text body). `depth` indents the row for nested lists. */
export function BlockRow(props: BlockRowProps) {
  const { block, onEdit, onRemove, onDuplicate, onIndent, onEnter, dnd } = props;
  const { cls, rowDrag, handle } = useBlockDrag(block, onEdit, dnd);
  const style = { marginLeft: `${(block.depth ?? 0) * 24}px` };
  const controls = <BlockControls block={block} onDuplicate={onDuplicate} onRemove={onRemove} />;

  if (block.type === 'divider') {
    return (
      <div className={cls} style={style} {...rowDrag}>
        {handle}
        <hr />
        <BlockControls block={block} onDuplicate={onDuplicate} onRemove={onRemove} withDelete />
      </div>
    );
  }

  if (block.type === 'image') {
    return (
      <div className={cls} style={style} {...rowDrag}>
        {handle}
        <ImageBlock block={block} onEdit={onEdit} />
        {controls}
      </div>
    );
  }

  return (
    <div className={cls} style={style} {...rowDrag}>
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
      <TextBlockBody
        block={block}
        onEdit={onEdit}
        onRemove={onRemove}
        onEnter={onEnter}
        onIndent={(dir) => onIndent(block.id, dir)}
      />
      {controls}
    </div>
  );
}
