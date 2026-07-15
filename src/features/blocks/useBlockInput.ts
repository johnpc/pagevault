import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { markdownShortcut } from './blockText';
import { applyFormatKey } from './wrapSelection';
import { makeEditKey } from './blockEditKey';
import { useReconciled } from './useReconciled';

/** The keyed edit callbacks a block's textarea drives (Enter/Tab/merge/dup). */
export interface BlockEdits {
  onEnter: (caret: number, value: string) => boolean;
  onIndent: (dir: 'in' | 'out') => void;
  onMerge: (value: string) => boolean;
  onMergeForward: (value: string) => boolean;
  onDuplicate?: () => void;
}

/**
 * Editing behavior for one block's textarea: local value, markdown-prefix
 * conversion, and Enter/Backspace/format handling. Keeps BlockRow render-only.
 */
export function useBlockInput(
  block: BlockRecord,
  onEdit: (id: string, patch: Partial<BlockRecord>) => void,
  onRemove: (id: string) => void,
  { onEnter, onIndent, onMerge, onMergeForward, onDuplicate }: BlockEdits,
) {
  const [focused, setFocused] = useState(false);
  // Adopt a realtime edit from another tab/device, but only while unfocused so
  // the caret is never yanked mid-type. (See useReconciled.)
  const [value, setValue] = useReconciled(block.content, focused);

  const change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    const shortcut = block.type === 'text' ? markdownShortcut(next) : null;
    if (shortcut) {
      setValue(shortcut.content);
      onEdit(block.id, { type: shortcut.type, content: shortcut.content });
      return;
    }
    setValue(next);
  };

  // Tab/Enter/Backspace/edge-arrow handling (see makeEditKey).
  const editKey = makeEditKey({
    value,
    isCode: block.type === 'code',
    onIndent,
    onEnter,
    onRemove: () => onRemove(block.id),
    onMerge: () => onMerge(value),
    onMergeForward: () => onMergeForward(value),
    setValue,
  });

  const keyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl+D duplicates the whole block (Notion parity), before format keys.
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && onDuplicate) {
      e.preventDefault();
      onDuplicate();
      return;
    }
    // Cmd/Ctrl+B/I/E/U + Shift+S wraps the selection in the matching marker.
    if (applyFormatKey(e, value, block.type === 'code', setValue)) return;
    editKey(e);
  };

  const focus = () => setFocused(true);
  const save = () => {
    setFocused(false);
    onEdit(block.id, { content: value });
  };

  return { value, setValue, change, keyDown, save, focus, focused };
}
