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
  onSplit,
  autoFocus,
  onFocused,
}: {
  block: BlockRecord;
  handle: ReactNode;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (block: BlockRecord) => void;
  onIndent: (id: string, dir: 'in' | 'out') => void;
  onPasteMarkdown: (block: BlockRecord, text: string) => void;
  onSplit: (block: BlockRecord, caret: number, value: string) => boolean;
  autoFocus?: boolean;
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
        onEnter={(caret, value) => onSplit(block, caret, value)}
        onIndent={(dir) => onIndent(block.id, dir)}
        onPasteMarkdown={(text) => onPasteMarkdown(block, text)}
        autoFocus={autoFocus}
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
