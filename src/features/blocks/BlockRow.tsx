import type { BlockRecord } from '../../lib/pbClient';
import { useBlockDrag } from './useBlockDrag';
import { MediaBlockRow } from './MediaBlockRow';
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
  onPasteMarkdown: (block: BlockRecord, text: string) => void;
  onUpload: (id: string, file: File) => void;
  onEnter: (caret: number, value: string) => boolean;
  autoFocus?: boolean;
  onFocused?: () => void;
  dnd: BlockDndHandlers;
}

/** One block row: the drag handle + a type-specific body (divider rule, image,
 * or the editable text body). `depth` indents the row for nested lists. */
export function BlockRow(props: BlockRowProps) {
  const { block, onEdit, onRemove, onDuplicate, onIndent, onPasteMarkdown } = props;
  const { onEnter, autoFocus, onFocused, dnd } = props;
  const { cls, rowDrag, handle } = useBlockDrag(block, onEdit, dnd);
  const style = { marginLeft: `${(block.depth ?? 0) * 24}px` };
  const onColor = (id: string, color: string) => onEdit(id, { color });
  const controls = (
    <BlockControls block={block} onDuplicate={onDuplicate} onRemove={onRemove} onColor={onColor} />
  );

  // Divider / image / table render as whole elements, not an editable text line.
  const media = (
    <MediaBlockRow
      block={block}
      cls={cls}
      style={style}
      rowDrag={rowDrag}
      handle={handle}
      onEdit={onEdit}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      onUpload={props.onUpload}
    />
  );
  const mediaTypes = ['divider', 'image', 'table', 'columns'];
  if (mediaTypes.includes(block.type)) return media;

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
      {block.type === 'toggle' && (
        <button
          className="pv-toggle-chevron"
          aria-label={block.collapsed ? 'Expand toggle' : 'Collapse toggle'}
          aria-expanded={!block.collapsed}
          onClick={() => onEdit(block.id, { collapsed: !block.collapsed })}
        >
          {block.collapsed ? '▸' : '▾'}
        </button>
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
        onPasteMarkdown={(text) => onPasteMarkdown(block, text)}
        autoFocus={autoFocus}
        onFocused={onFocused}
      />
      {controls}
    </div>
  );
}
