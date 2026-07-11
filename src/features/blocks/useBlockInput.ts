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

  const keyDown = (e: KeyboardEvent) => {
    if (matches && matches.length > 0) {
      if (e.key === 'ArrowDown')
        return (e.preventDefault(), setActive((a) => (a + 1) % matches.length));
      if (e.key === 'ArrowUp')
        return (e.preventDefault(), setActive((a) => (a - 1 + matches.length) % matches.length));
      if (e.key === 'Enter') return (e.preventDefault(), pick(matches[active].type));
      if (e.key === 'Escape') return (e.preventDefault(), setValue(''));
    }
    if (e.key === 'Enter' && !e.shiftKey) {
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
