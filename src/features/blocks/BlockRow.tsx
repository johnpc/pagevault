import type { BlockRecord } from '../../lib/pbClient';
import { placeholderFor } from './blockText';
import { useBlockInput } from './useBlockInput';
import { useBlockDrag } from './useBlockDrag';
import { SlashMenu } from './SlashMenu';
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
 * growing textarea with a slash-command menu. The ⋮⋮ handle drags to reorder. */
export function BlockRow({ block, onEdit, onRemove, onEnter, dnd }: BlockRowProps) {
  const { value, change, keyDown, save, matches, active, pick } = useBlockInput(
    block,
    onEdit,
    onRemove,
    onEnter,
  );
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
      {matches && <SlashMenu commands={matches} active={active} onPick={pick} />}
    </div>
  );
}
