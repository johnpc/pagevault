import type { ReactNode } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { BlockLead } from './BlockLead';
import { TextBlockBody } from './TextBlockBody';
import { BlockControls } from './BlockControls';
import { BlockCursors } from '../presence/BlockCursors';
import { CalloutIcon } from './CalloutIcon';

/** The inner content of an editable (non-media) block row: presence cursors,
 * lead (chevron/marker), an optional callout icon, the editable text body, and
 * the hover controls. Split from BlockRow so that stays render-only + short. */
export function TextBlockRow({
  block,
  handle,
  onEdit,
  onRemove,
  onDuplicate,
  onIndent,
  onPasteMarkdown,
  onUpload,
  onSplit,
  onMerge,
  onMergeForward,
  autoFocus,
  autoFocusCaret,
  autoFocusValue,
  onFocused,
}: {
  block: BlockRecord;
  handle: ReactNode;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (block: BlockRecord) => void;
  onIndent: (id: string, dir: 'in' | 'out') => void;
  onPasteMarkdown: (block: BlockRecord, text: string) => void;
  onUpload: (id: string, file: File) => void;
  onSplit: (block: BlockRecord, caret: number, value: string) => boolean;
  onMerge: (id: string, value: string) => boolean;
  onMergeForward: (id: string, value: string) => boolean;
  autoFocus?: boolean;
  autoFocusCaret?: number;
  autoFocusValue?: string;
  onFocused?: () => void;
}) {
  return (
    <>
      <BlockCursors blockId={block.id} />
      <BlockLead block={block} onEdit={onEdit} />
      {handle}
      {block.type === 'callout' && (
        <CalloutIcon value={block.emoji ?? ''} onPick={(emoji) => onEdit(block.id, { emoji })} />
      )}
      <TextBlockBody
        block={block}
        onEdit={onEdit}
        onRemove={onRemove}
        onDuplicate={() => onDuplicate(block)}
        onEnter={(caret, value) => onSplit(block, caret, value)}
        onIndent={(dir) => onIndent(block.id, dir)}
        onMerge={(value) => onMerge(block.id, value)}
        onMergeForward={(value) => onMergeForward(block.id, value)}
        onPasteMarkdown={(text) => onPasteMarkdown(block, text)}
        onPasteImage={(file) => {
          // Turn the empty block into an image block, then upload the file into it.
          onEdit(block.id, { type: 'image' });
          onUpload(block.id, file);
        }}
        autoFocus={autoFocus}
        autoFocusCaret={autoFocusCaret}
        autoFocusValue={autoFocusValue}
        onFocused={onFocused}
      />
      <BlockControls
        block={block}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        align
      />
    </>
  );
}
