import { memo } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { useBlockDrag } from './useBlockDrag';
import { MediaBlockRow } from './MediaBlockRow';
import { TextBlockRow } from './TextBlockRow';
import { alignClass } from './blockAlign';
import { blockAnchorId } from './tocData';
import { useReportFocus } from '../presence/useReportFocus';
import './BlockRow.css';

/** Block types that render as a whole element via MediaBlockRow, not a text line. */
const MEDIA_TYPES = new Set(['divider', 'image', 'table', 'columns', 'toc', 'bookmark', 'embed']);

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
  onSplit: (block: BlockRecord, caret: number, value: string) => boolean;
  onMerge: (id: string, value: string) => boolean;
  autoFocus?: boolean;
  autoFocusCaret?: number;
  autoFocusValue?: string;
  onFocused?: () => void;
  dnd: BlockDndHandlers;
}

/** One block row: drag handle + a type-specific body (divider/image/media or the
 * editable text body). Memoized below so a sibling's edit/selection/drag doesn't
 * re-render every row — only rows whose own props change. */
function BlockRowInner(props: BlockRowProps) {
  const { block, onEdit, onRemove, onDuplicate, onIndent, onPasteMarkdown } = props;
  const { onSplit, onMerge, autoFocus, autoFocusCaret, autoFocusValue, onFocused, dnd } = props;
  const { cls, rowDrag, handle } = useBlockDrag(block, onEdit, dnd);
  const focusReport = useReportFocus(block.id);
  const style = { marginLeft: `${(block.depth ?? 0) * 24}px` };
  const rowCls = `${cls} ${alignClass(block.align)}`.trim();

  // Divider / image / table render as whole elements, not an editable text line.
  if (MEDIA_TYPES.has(block.type)) {
    return (
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
  }

  return (
    <div
      id={blockAnchorId(block.id)}
      className={rowCls}
      style={style}
      {...rowDrag}
      {...focusReport}
    >
      <TextBlockRow
        block={block}
        handle={handle}
        onEdit={onEdit}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
        onIndent={onIndent}
        onPasteMarkdown={onPasteMarkdown}
        onSplit={onSplit}
        onMerge={onMerge}
        autoFocus={autoFocus}
        autoFocusCaret={autoFocusCaret}
        autoFocusValue={autoFocusValue}
        onFocused={onFocused}
      />
    </div>
  );
}

export const BlockRow = memo(BlockRowInner);
