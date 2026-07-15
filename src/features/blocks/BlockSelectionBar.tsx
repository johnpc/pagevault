import type { BlockType } from '../../lib/pbTypes';
import { BLOCK_COLORS } from './blockColors';
import { TurnIntoMenu } from './TurnIntoMenu';

/** A floating action bar shown while multiple blocks are selected: the count,
 * a row of color swatches (colors the whole selection), turn-into, duplicate,
 * and delete. Buttons use onMouseDown + preventDefault so clicking never clears
 * the block selection (a plain mousedown elsewhere does). Hidden when count 0. */
export function BlockSelectionBar({
  count,
  onColor,
  onTurnInto,
  onDuplicate,
  onDelete,
}: {
  count: number;
  onColor: (color: string) => void;
  onTurnInto: (type: BlockType) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="pv-selbar" role="toolbar" aria-label="Selected blocks">
      <span className="pv-selbar-count">{count} selected</span>
      {BLOCK_COLORS.map((c) => (
        <button
          key={c.token || 'default'}
          type="button"
          className={`pv-color-item pv-color--${c.token || 'default'}`}
          aria-label={`Color ${c.label}`}
          title={c.label}
          onMouseDown={(e) => {
            e.preventDefault();
            onColor(c.token);
          }}
        >
          <span className="pv-color-swatch" aria-hidden="true">
            {c.swatch}
          </span>
        </button>
      ))}
      <TurnIntoMenu current={'text'} onPick={onTurnInto} />
      <button
        type="button"
        className="pv-selbar-dup"
        aria-label="Duplicate selected blocks"
        onMouseDown={(e) => {
          e.preventDefault();
          onDuplicate();
        }}
      >
        ⧉
      </button>
      <button
        type="button"
        className="pv-selbar-del"
        aria-label="Delete selected blocks"
        onMouseDown={(e) => {
          e.preventDefault();
          onDelete();
        }}
      >
        🗑
      </button>
    </div>
  );
}
