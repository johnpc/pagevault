import type { BlockType } from '../../lib/pbTypes';
import type { SlashCommand } from './slashCommands';

interface SlashNavActions {
  setActive: (fn: (a: number) => number) => void;
  pick: (type: BlockType) => void;
  clear: () => void;
}

/**
 * Handle an Arrow/Enter/Escape keystroke while the slash menu is open: move the
 * active index (wrapping), pick the active command, or clear the query. Returns
 * true when it consumed the key. Pure control-flow over the passed actions.
 */
export function slashNav(
  e: { key: string; preventDefault: () => void },
  matches: SlashCommand[] | null,
  active: number,
  actions: SlashNavActions,
): boolean {
  if (!matches || matches.length === 0) return false;
  const handlers: Record<string, () => void> = {
    ArrowDown: () => actions.setActive((a) => (a + 1) % matches.length),
    ArrowUp: () => actions.setActive((a) => (a - 1 + matches.length) % matches.length),
    Enter: () => actions.pick(matches[active].type),
    Escape: () => actions.clear(),
  };
  const fn = handlers[e.key];
  if (!fn) return false;
  e.preventDefault();
  fn();
  return true;
}
