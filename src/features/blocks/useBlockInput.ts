import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';
import { markdownShortcut } from './blockText';
import { slashMatches, type SlashCommand } from './slashCommands';

/**
 * Editing behavior for one block's textarea: local value, markdown-prefix
 * conversion, the slash-command menu, and Enter/Backspace handling. Keeps
 * BlockRow render-only.
 */
export function useBlockInput(
  block: BlockRecord,
  onEdit: (id: string, patch: Partial<BlockRecord>) => void,
  onRemove: (id: string) => void,
  onEnter: () => void,
  onIndent: (dir: 'in' | 'out') => void,
) {
  const [value, setValue] = useState(block.content);
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);

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
  // Returns true when it handled the key (so keyDown stops).
  const slashKey = (e: KeyboardEvent): boolean => {
    if (!matches || matches.length === 0) return false;
    const handlers: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => (a + 1) % matches.length),
      ArrowUp: () => setActive((a) => (a - 1 + matches.length) % matches.length),
      Enter: () => pick(matches[active].type),
      Escape: () => setValue(''),
    };
    const fn = handlers[e.key];
    if (!fn) return false;
    e.preventDefault();
    fn();
    return true;
  };

  const keyDown = (e: KeyboardEvent) => {
    if (slashKey(e)) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      onIndent(e.shiftKey ? 'out' : 'in');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEdit(block.id, { content: value });
      onEnter();
    } else if (e.key === 'Backspace' && value === '') {
      e.preventDefault();
      onRemove(block.id);
    }
  };

  const focus = () => setFocused(true);
  const save = () => {
    setFocused(false);
    onEdit(block.id, { content: value });
  };

  return { value, change, keyDown, save, focus, focused, matches, active, pick };
}
