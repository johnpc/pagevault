import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';
import { markdownShortcut } from './blockText';
import { slashMatches, type SlashCommand } from './slashCommands';
import { slashNav } from './slashNav';
import { applyFormatKey } from './wrapSelection';
import { makeEditKey } from './blockEditKey';
import { useReconciled } from './useReconciled';

/**
 * Editing behavior for one block's textarea: local value, markdown-prefix
 * conversion, the slash-command menu, and Enter/Backspace handling. Keeps
 * BlockRow render-only.
 */
export function useBlockInput(
  block: BlockRecord,
  onEdit: (id: string, patch: Partial<BlockRecord>) => void,
  onRemove: (id: string) => void,
  onEnter: (caret: number, value: string) => boolean,
  onIndent: (dir: 'in' | 'out') => void,
) {
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  // Adopt a realtime edit from another tab/device, but only while unfocused so
  // the caret is never yanked mid-type. (See useReconciled.)
  const [value, setValue] = useReconciled(block.content, focused);

  // Slash menu is available only on an empty-ish text block (Notion behavior).
  const matches = useMemo<SlashCommand[] | null>(
    () => (block.type === 'text' ? slashMatches(value) : null),
    [block.type, value],
  );

  const pick = (type: BlockType) => {
    setValue('');
    setActive(0);
    onEdit(block.id, { type, content: '' });
  };

  const change = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    const shortcut = block.type === 'text' ? markdownShortcut(next) : null;
    if (shortcut) {
      setValue(shortcut.content);
      onEdit(block.id, { type: shortcut.type, content: shortcut.content });
      return;
    }
    setActive(0);
    setValue(next);
  };

  // Slash-menu navigation, factored out to keep keyDown's complexity low.
  const slashKey = (e: KeyboardEvent): boolean =>
    slashNav(e, matches, active, { setActive, pick, clear: () => setValue('') });

  // Tab/Enter/Backspace/edge-arrow handling (see makeEditKey).
  const editKey = makeEditKey({
    value,
    onIndent,
    onEnter,
    onRemove: () => onRemove(block.id),
    setValue,
  });

  const keyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashKey(e)) return;
    // Cmd/Ctrl+B/I/E wraps the selection in the matching markdown marker.
    if (applyFormatKey(e, value, block.type === 'code', setValue)) return;
    editKey(e);
  };

  const focus = () => setFocused(true);
  const save = () => {
    setFocused(false);
    onEdit(block.id, { content: value });
  };

  return { value, setValue, change, keyDown, save, focus, focused, matches, active, pick };
}
