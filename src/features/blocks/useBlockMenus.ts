import { type KeyboardEvent, type RefObject, type SyntheticEvent } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { useMention } from './useMention';
import { useSlashMenu } from './useSlashMenu';

/**
 * The two caret-driven pickers a text block can show — the @-mention page picker
 * and the "/" block-type menu — plus the merged key/selection handlers. The
 * mention picker gets first crack at Arrow/Enter/Escape, then the slash menu;
 * `onKeyDown` returns true when either consumed the key so the caller can skip
 * its own handling. `onSelect` feeds both their caret trackers. Extracted so
 * TextBlockBody stays render-only and under length.
 */
export function useBlockMenus(
  block: BlockRecord,
  value: string,
  setValue: (v: string) => void,
  inputRef: RefObject<HTMLTextAreaElement | null>,
  onEdit: (id: string, patch: Partial<BlockRecord>) => void,
) {
  const mention = useMention(block.page, value, setValue, inputRef);
  const slash = useSlashMenu(block.type === 'text', value, inputRef, {
    convert: (type, content) => (setValue(content), onEdit(block.id, { type, content })),
  });

  const onKeyDown = (e: KeyboardEvent): boolean => mention.onKeyDown(e) || slash.onKeyDown(e);

  const onSelect = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    mention.onSelect(e);
    slash.onSelect(e);
  };

  return { mention, slash, onKeyDown, onSelect };
}
