import { useRef } from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { placeholderFor } from './blockText';
import { hasInlineMarkup } from './inlineMarkdown';
import { useBlockInput } from './useBlockInput';
import { SlashMenu } from './SlashMenu';
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
}: {
  block: BlockRecord;
  onEdit: (id: string, patch: Partial<BlockRecord>) => void;
  onRemove: (id: string) => void;
  onEnter: () => void;
  onIndent: (dir: 'in' | 'out') => void;
}) {
  const { value, change, keyDown, save, focus, focused, matches, active, pick } = useBlockInput(
    block,
    onEdit,
    onRemove,
    onEnter,
    onIndent,
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const showPreview = !focused && hasInlineMarkup(value);

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
          onKeyDown={keyDown}
        />
      )}
      {matches && <SlashMenu commands={matches} active={active} onPick={pick} />}
    </>
  );
}
