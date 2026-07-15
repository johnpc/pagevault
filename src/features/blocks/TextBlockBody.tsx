import { useRef } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { hasInlineMarkup } from './inlineMarkdown';
import { useBlockInput, type BlockEdits } from './useBlockInput';
import { useBlockPaste } from './useBlockPaste';
import { useBlockMenus } from './useBlockMenus';
import { useSelectionToolbar } from './useSelectionToolbar';
import { useAutoFocus } from './useAutoFocus';
import { useSeedValue } from './useSeedValue';
import { BlockMenus } from './BlockMenus';
import { BlockPreview } from './BlockPreview';
import { BlockEditable } from './BlockEditable';
import { SelectionToolbar } from './SelectionToolbar';
import { CodeBlockChrome } from './CodeBlockChrome';

/** The editable body of a text-ish block: an idle formatted preview (when it
 * has inline markup) that swaps to a raw textarea for editing, plus the slash
 * menu. Excludes divider/image, which BlockRow renders directly. */
export function TextBlockBody({
  block,
  onEdit,
  onRemove,
  onDuplicate,
  onEnter,
  onIndent,
  onMerge,
  onMergeForward,
  onPasteMarkdown,
  onPasteImage,
  autoFocus,
  autoFocusCaret,
  autoFocusValue,
  onFocused,
}: BlockEdits & {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onPasteMarkdown: (text: string) => void;
  onPasteImage: (file: File) => void;
  autoFocus?: boolean;
  autoFocusCaret?: number;
  autoFocusValue?: string;
  onFocused?: () => void;
}) {
  const edits = { onEnter, onIndent, onMerge, onMergeForward, onDuplicate };
  const io = useBlockInput(block, onEdit, onRemove, edits);
  const { value, setValue, change, keyDown, save, focus, focused } = io;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menus = useBlockMenus(block, value, setValue, inputRef, onEdit);
  const toolbar = useSelectionToolbar(inputRef, value, setValue, block.type === 'code');
  const showPreview = !focused && hasInlineMarkup(value);

  // The menu pickers get first crack at Arrow/Enter/Escape; if neither consumes
  // the key, the block's own handler runs.
  const onKeyDown = (e: Parameters<typeof keyDown>[0]) => {
    if (!menus.onKeyDown(e)) keyDown(e);
  };

  // A selection change feeds the pickers' caret trackers and the toolbar.
  const onSelect = (e: Parameters<typeof menus.onSelect>[0]) => {
    menus.onSelect(e);
    toolbar.sync();
  };
  // On blur, save + hide the toolbar (unless focus moved into its link prompt).
  const onBlur = () => (toolbar.hideUnlessInToolbar(), save());

  const onPaste = useBlockPaste(block.type === 'code', value, { setValue, onPasteMarkdown, onPasteImage }); // prettier-ignore

  // A Backspace-merge seeds the absorbing block's value (see useSeedValue), then
  // we focus it with the caret at the join (or the end, for an Enter-created one).
  useSeedValue(autoFocus, autoFocusValue, value, setValue);
  useAutoFocus(autoFocus, inputRef, onFocused, autoFocusCaret);

  return (
    <>
      {showPreview ? (
        <BlockPreview value={value} onEdit={focus} inputRef={inputRef} />
      ) : (
        <BlockEditable
          block={block}
          value={value}
          showPlaceholder={focused}
          inputRef={inputRef}
          onFocus={focus}
          onChange={change}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onSelect={onSelect}
          onPaste={onPaste}
        />
      )}
      <SelectionToolbar {...toolbar} />
      <CodeBlockChrome block={block} value={value} onEdit={onEdit} />
      <BlockMenus slash={menus.slash} mention={menus.mention} />
    </>
  );
}
