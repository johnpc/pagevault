import type { BlockRecord } from '../../lib/pbClient';
import { useBlockDrag } from './useBlockDrag';
import { MediaBlockRow } from './MediaBlockRow';
import { BlockLead } from './BlockLead';
import { TextBlockBody } from './TextBlockBody';
import { BlockControls } from './BlockControls';
import { blockAnchorId } from './tocData';
import './BlockRow.css';

/** Block types that render as a whole element via MediaBlockRow, not a text line. */
const MEDIA_TYPES = new Set(['divider', 'image', 'table', 'columns', 'toc']);

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
  if (MEDIA_TYPES.has(block.type)) return media;

  return (
    <div id={blockAnchorId(block.id)} className={cls} style={style} {...rowDrag}>
      <BlockLead block={block} onEdit={onEdit} />
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
