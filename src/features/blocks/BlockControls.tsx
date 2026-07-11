import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';
import { ColorMenu } from './ColorMenu';
import { TurnIntoMenu } from './TurnIntoMenu';
import { canTurnInto } from './turnInto';

/** The hover controls on a block row: turn-into, color, duplicate (+ delete for
 * dividers, which have no text to backspace-delete). Kept out of BlockRow to
 * keep it small. */
export function BlockControls({
  block,
  onDuplicate,
  onRemove,
  onColor,
  onTurnInto,
  withDelete = false,
}: {
  block: BlockRecord;
  onDuplicate: (block: BlockRecord) => void;
  onRemove: (id: string) => void;
  onColor: (id: string, color: string) => void;
  onTurnInto?: (id: string, type: BlockType) => void;
  withDelete?: boolean;
}) {
  return (
    <>
      {onTurnInto && canTurnInto(block.type) && (
        <TurnIntoMenu current={block.type} onPick={(type) => onTurnInto(block.id, type)} />
      )}
      <ColorMenu current={block.color ?? ''} onPick={(token) => onColor(block.id, token)} />
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
