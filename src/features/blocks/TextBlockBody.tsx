import { useEffect, useRef, type ClipboardEvent } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { placeholderFor } from './blockText';
import { hasInlineMarkup } from './inlineMarkdown';
import { looksLikeMarkdown } from './markdownImport';
import { useBlockInput } from './useBlockInput';
import { useMention } from './useMention';
import { SlashMenu } from './SlashMenu';
import { MentionMenu } from './MentionMenu';
import { FormattedText } from './FormattedText';

/** The editable body of a text-ish block: an idle formatted preview (when it
 * has inline markup) that swaps to a raw textarea for editing, plus the slash
 * menu. Excludes divider/image, which BlockRow renders directly. */
export function TextBlockBody({
  block,
  onEdit,
  onRemove,
  onEnter,
  onIndent,
  onPasteMarkdown,
  autoFocus,
  onFocused,
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onEnter: (caret: number, value: string) => boolean;
  onIndent: (dir: 'in' | 'out') => void;
  onPasteMarkdown: (text: string) => void;
  autoFocus?: boolean;
  onFocused?: () => void;
}) {
  const { value, setValue, change, keyDown, save, focus, focused, matches, active, pick } =
    useBlockInput(block, onEdit, onRemove, onEnter, onIndent);
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

  // When this block was just created by Enter, grab focus so typing flows on.
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      onFocused?.();
    }
  }, [autoFocus, onFocused]);

  return (
    <>
      {showPreview ? (
        <div
          className="pv-block-preview"
          role="button"
          tabIndex={0}
          onClick={() => {
            focus();
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
        >
          <FormattedText text={value} />
        </div>
      ) : (
        <textarea
          ref={inputRef}
          className="pv-block-input"
          aria-label="Block content"
          rows={1}
          value={value}
          placeholder={placeholderFor(block.type)}
          onFocus={focus}
          onChange={change}
          onBlur={save}
          onKeyDown={onKeyDown}
          onSelect={mention.onSelect}
          onPaste={onPaste}
        />
      )}
      {matches && <SlashMenu commands={matches} active={active} onPick={pick} />}
      {mention.open && (
        <MentionMenu pages={mention.matches} active={mention.active} onPick={mention.pick} />
      )}
    </>
  );
}
