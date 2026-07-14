import type { BlockRecord } from '../../lib/pbClient';
import { BlockRow, type BlockDndHandlers } from '../blocks/BlockRow';
import { useBlockSelection } from '../blocks/useBlockSelection';

interface BlockRowsProps {
  visible: BlockRecord[];
  dnd: BlockDndHandlers;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onRemoveMany: (ids: string[]) => void;
  onIndentMany: (ids: string[], dir: 'in' | 'out') => void;
  onDuplicate: (block: BlockRecord) => void;
  onIndent: (id: string, dir: 'in' | 'out') => void;
  onPasteMarkdown: (block: BlockRecord, text: string) => void;
  onSplit: (block: BlockRecord, caret: number, value: string) => boolean;
  onMerge: (id: string, value: string) => boolean;
  onUpload: (id: string, file: File) => void;
  focusId: string | null;
  focusCaret?: number;
  focusValue?: string;
  onFocused: () => void;
}

/** The block rows + keyboard multi-selection. A single container keydown drives
 * selection (Shift+Arrow to start from a caret edge, Arrows to move, Backspace/
 * Delete to remove the range); a click anywhere clears it. Rows carry
 * data-block-index so a textarea handoff knows its position. */
export function BlockRows(props: BlockRowsProps) {
  const { visible, onRemoveMany, onIndentMany, ...row } = props;
  const ids = visible.map((b) => b.id);
  const selection = useBlockSelection(ids, {
    onDeleteMany: onRemoveMany,
    onIndentMany,
  });

  // A plain mousedown clears an active selection; a Shift+mousedown extends the
  // block selection to the clicked row (and suppresses the browser's text
  // selection) instead of clearing.
  const onRowMouseDown = (e: React.MouseEvent, index: number) => {
    if (e.shiftKey) {
      e.preventDefault();
      selection.shiftClick(index);
    } else if (selection.active) {
      selection.clear();
    }
  };

  return (
    <div className="pv-blocks" onKeyDown={selection.onKeyDown}>
      {visible.map((block, index) => (
        <div
          key={block.id}
          data-block-index={index}
          className={selection.selectedAt(index) ? 'pv-block-selected' : undefined}
          onMouseDown={(e) => onRowMouseDown(e, index)}
          onFocus={() => selection.noteFocus(index)}
        >
          <BlockRow
            block={block}
            onEdit={row.onEdit}
            onRemove={row.onRemove}
            onDuplicate={row.onDuplicate}
            onIndent={row.onIndent}
            onPasteMarkdown={row.onPasteMarkdown}
            onUpload={row.onUpload}
            onSplit={row.onSplit}
            onMerge={row.onMerge}
            autoFocus={block.id === props.focusId}
            autoFocusCaret={block.id === props.focusId ? props.focusCaret : undefined}
            autoFocusValue={block.id === props.focusId ? props.focusValue : undefined}
            onFocused={row.onFocused}
            dnd={row.dnd}
          />
        </div>
      ))}
    </div>
  );
}
