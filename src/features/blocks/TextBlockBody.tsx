import { useRef, type ClipboardEvent } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { hasInlineMarkup } from './inlineMarkdown';
import { looksLikeMarkdown } from './markdownImport';
import { useBlockInput } from './useBlockInput';
import { useMention } from './useMention';
import { useAutoFocus } from './useAutoFocus';
import { useSeedValue } from './useSeedValue';
import { BlockMenus } from './BlockMenus';
import { BlockPreview } from './BlockPreview';
import { BlockTextarea } from './BlockTextarea';
import { CodeBlockChrome } from './CodeBlockChrome';

/** The editable body of a text-ish block: an idle formatted preview (when it
 * has inline markup) that swaps to a raw textarea for editing, plus the slash
 * menu. Excludes divider/image, which BlockRow renders directly. */
export function TextBlockBody({
  block,
  onEdit,
  onRemove,
  onEnter,
  onIndent,
  onMerge,
  onMergeForward,
  onPasteMarkdown,
  autoFocus,
  autoFocusCaret,
  autoFocusValue,
  onFocused,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onEnter: (caret: number, value: string) => boolean;
  onIndent: (dir: 'in' | 'out') => void;
  onMerge: (value: string) => boolean;
  onMergeForward: (value: string) => boolean;
  onPasteMarkdown: (text: string) => void;
  autoFocus?: boolean;
  autoFocusCaret?: number;
  autoFocusValue?: string;
  onFocused?: () => void;
}) {
  const { value, setValue, change, keyDown, save, focus, focused, matches, active, pick } =
    useBlockInput(block, onEdit, onRemove, onEnter, onIndent, onMerge, onMergeForward);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mention = useMention(block.page, value, setValue, inputRef);
  const showPreview = !focused && hasInlineMarkup(value);

  // The @-mention picker gets first crack at Arrow/Enter/Escape; if it doesn't
  // consume the key, the block's own handler runs.
  const onKeyDown = (e: Parameters<typeof keyDown>[0]) => {
    if (!mention.onKeyDown(e)) keyDown(e);
  };

  // Pasting multi-line / markdown-y text into an empty block imports it as blocks.
  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text/plain');
    if (value === '' && looksLikeMarkdown(text)) {
      e.preventDefault();
      onPasteMarkdown(text);
    }
  };

  // A Backspace-merge seeds the absorbing block's value (see useSeedValue), then
  // we focus it with the caret at the join (or the end, for an Enter-created one).
  useSeedValue(autoFocus, autoFocusValue, value, setValue);
  useAutoFocus(autoFocus, inputRef, onFocused, autoFocusCaret);

  return (
    <>
      {showPreview ? (
        <BlockPreview value={value} onEdit={focus} inputRef={inputRef} />
      ) : (
        <BlockTextarea
          block={block}
          value={value}
          inputRef={inputRef}
          onFocus={focus}
          onChange={change}
          onBlur={save}
          onKeyDown={onKeyDown}
          onSelect={mention.onSelect}
          onPaste={onPaste}
        />
      )}
      <CodeBlockChrome block={block} value={value} onEdit={onEdit} />
      <BlockMenus matches={matches} active={active} onPick={pick} mention={mention} />
    </>
  );
}
