import type { BlockRecord } from '../../lib/pbClient';
import { ColorMenu } from './ColorMenu';

/** The hover controls on a block row: color, duplicate (+ delete for dividers,
 * which have no text to backspace-delete). Kept out of BlockRow to keep it
 * small. */
export function BlockControls({
  block,
  onDuplicate,
  onRemove,
  onColor,
  withDelete = false,
}: {
  block: BlockRecord;
  onDuplicate: (block: BlockRecord) => void;
  onRemove: (id: string) => void;
  onColor: (id: string, color: string) => void;
  withDelete?: boolean;
}) {
  return (
    <>
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
