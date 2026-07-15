import { useMemo, useState, type KeyboardEvent, type RefObject, type SyntheticEvent } from 'react';
import type { BlockType } from '../../lib/pbTypes';
import { slashQuery, type SlashQuery } from './slashQuery';
import { filterCommands, type SlashCommand } from './slashCommands';

interface SlashActions {
  /** Convert the block to `type`, keeping `content` (the value minus the query). */
  convert: (type: BlockType, content: string) => void;
}

/**
 * The "/" command menu for a block textarea. Watches for a "/query" at the caret
 * — so the menu opens MID-LINE, not only on a block that starts with '/' — and
 * surfaces matching block types; Arrow/Enter/Escape drive selection. Picking a
 * command strips the "/query" span and converts the block, keeping the rest of
 * the text (Notion behavior). Owns caret tracking so TextBlockBody stays render-
 * only. Mirrors useMention; only active on plain text blocks.
 */
export function useSlashMenu(
  enabled: boolean,
  value: string,
  ref: RefObject<HTMLTextAreaElement | null>,
  actions: SlashActions,
) {
  const [active, setActive] = useState(0);
  const [caret, setCaret] = useState(0);
  // The start index of a query the user dismissed with Escape; the menu stays
  // hidden for that same "/" (keeping the typed text) and reopens once the query
  // moves to a different slash. null = nothing dismissed.
  const [dismissed, setDismissed] = useState<number | null>(null);

  const query = useMemo<SlashQuery | null>(
    () => (enabled ? slashQuery(value, caret) : null),
    [enabled, value, caret],
  );
  const matches = useMemo<SlashCommand[]>(
    () => (query ? filterCommands(query.query) : []),
    [query],
  );
  // Open whenever a (non-dismissed) slash query is active — even with zero
  // matches, so the menu can show "No results" instead of silently vanishing.
  const open = !!query && query.start !== dismissed;

  const onSelect = (e: SyntheticEvent<HTMLTextAreaElement>) =>
    setCaret(e.currentTarget.selectionStart);

  const pick = (type: BlockType) => {
    if (!query) return;
    const content = value.slice(0, query.start) + value.slice(query.end);
    setActive(0);
    actions.convert(type, content);
    // Land the caret where the query was, on the (possibly reused) block.
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.setSelectionRange(query.start, query.start);
        setCaret(query.start);
      }
    });
  };

  const onKeyDown = (e: KeyboardEvent): boolean => {
    if (!open) return false;
    // Escape always dismisses; the movement/pick keys only apply with matches
    // (on a "No results" query, let ↑/↓/Enter fall through to the textarea).
    if (e.key === 'Escape') {
      e.preventDefault();
      setActive(0);
      setDismissed(query?.start ?? null);
      return true;
    }
    if (matches.length === 0) return false;
    const nav: Record<string, () => void> = {
      ArrowDown: () => setActive((a) => (a + 1) % matches.length),
      ArrowUp: () => setActive((a) => (a - 1 + matches.length) % matches.length),
      Enter: () => pick(matches[active].type),
    };
    if (!nav[e.key]) return false;
    e.preventDefault();
    nav[e.key]();
    return true;
  };

  return { open, matches, active, pick, onSelect, onKeyDown };
}
