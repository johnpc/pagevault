import type { BlockRecord } from '../../lib/pbClient';
import { ColorMenu } from './ColorMenu';
import { AlignMenu } from './AlignMenu';
import { TurnIntoMenu } from './TurnIntoMenu';
import { CopyLinkButton } from './CopyLinkButton';
import { canTurnInto } from './turnInto';

/** The hover controls on a block row: turn-into, color, align, duplicate (+
 * delete for dividers, which have no text to backspace-delete). All edits go
 * through `onEdit`. `align` shows the alignment picker (text blocks only). */
export function BlockControls({
  block,
  onEdit,
  onDuplicate,
  onRemove,
  align = false,
  withDelete = false,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onDuplicate: (block: BlockRecord) => void;
  onRemove: (id: string) => void;
  align?: boolean;
  withDelete?: boolean;
}) {
  return (
    <>
      {canTurnInto(block.type) && (
        <TurnIntoMenu current={block.type} onPick={(type) => onEdit(block.id, { type })} />
      )}
      <ColorMenu current={block.color ?? ''} onPick={(color) => onEdit(block.id, { color })} />
      {align && (
        <AlignMenu current={block.align ?? ''} onPick={(a) => onEdit(block.id, { align: a })} />
      )}
      <CopyLinkButton pageId={block.page} blockId={block.id} />
      <button
        className="pv-block-dup"
        aria-label="Duplicate block"
        onClick={() => onDuplicate(block)}
      >
        ⧉
      </button>
      {withDelete && (
        <button
          className="pv-block-del"
          aria-label="Delete block"
          onClick={() => onRemove(block.id)}
        >
          ×
        </button>
      )}
    </>
  );
}
