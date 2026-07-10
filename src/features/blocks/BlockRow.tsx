import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { placeholderFor, cycleType, markdownShortcut } from './blockText';
import './BlockRow.css';

interface BlockRowProps {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onEnter: () => void;
}

/** One editable content block. A divider renders a rule; everything else is a
 * growing textarea. The style button cycles the block type. */
export function BlockRow({ block, onEdit, onRemove, onEnter }: BlockRowProps) {
  const [value, setValue] = useState(block.content);

  // Notion-style markdown: typing a prefix like "# " or "- " converts the block.
  const change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    const shortcut = block.type === 'text' ? markdownShortcut(next) : null;
    if (shortcut) {
      setValue(shortcut.content);
      onEdit(block.id, { type: shortcut.type, content: shortcut.content });
    } else {
      setValue(next);
    }
  };

  const keyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEdit(block.id, { content: value });
      onEnter();
    } else if (e.key === 'Backspace' && value === '') {
      e.preventDefault();
      onRemove(block.id);
    }
  };

  if (block.type === 'divider') {
    return (
      <div className="pv-block pv-block--divider">
        <hr />
        <button
          className="pv-block-del"
          aria-label="Delete block"
          onClick={() => onRemove(block.id)}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className={`pv-block pv-block--${block.type}`}>
      {block.type === 'todo' && (
        <input
          type="checkbox"
          aria-label="Toggle to-do"
          checked={block.checked}
          onChange={(e) => onEdit(block.id, { checked: e.target.checked })}
        />
      )}
      <button
        className="pv-block-style"
        aria-label="Change block type"
        onClick={() => onEdit(block.id, { type: cycleType(block.type) })}
      >
        ⋮⋮
      </button>
      <textarea
        className="pv-block-input"
        aria-label="Block content"
        rows={1}
        value={value}
        placeholder={placeholderFor(block.type)}
        onChange={change}
        onBlur={() => onEdit(block.id, { content: value })}
        onKeyDown={keyDown}
      />
    </div>
  );
}
