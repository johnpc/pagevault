import type { BlockRecord } from '../../lib/pbClient';

/** The small leading affordance before a text block's body: a to-do checkbox, a
 * toggle chevron, or a callout icon — whichever the block type calls for. Keeps
 * BlockRow's render lean. */
export function BlockLead({
  block,
  onEdit,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
}) {
  if (block.type === 'todo') {
    return (
      <input
        type="checkbox"
        aria-label="Toggle to-do"
        checked={block.checked}
        onChange={(e) => onEdit(block.id, { checked: e.target.checked })}
      />
    );
  }
  if (block.type === 'toggle') {
    return (
      <button
        className="pv-toggle-chevron"
        aria-label={block.collapsed ? 'Expand toggle' : 'Collapse toggle'}
        aria-expanded={!block.collapsed}
        onClick={() => onEdit(block.id, { collapsed: !block.collapsed })}
      >
        {block.collapsed ? '▸' : '▾'}
      </button>
    );
  }
  return null;
}
