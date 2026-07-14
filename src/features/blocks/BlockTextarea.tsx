import type {
  RefObject,
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent,
  FocusEvent,
  ReactEventHandler,
} from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { placeholderFor } from './blockText';
import { CodeHighlight } from './CodeHighlight';

interface BlockTextareaProps {
  block: BlockRecord;
  value: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onFocus: () => void;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSelect: ReactEventHandler<HTMLTextAreaElement>;
  onPaste: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
}

/** The editable textarea for a block. For a `code` block with a language it also
 * paints a read-only syntax-highlighted layer behind a transparent textarea, so
 * the caret/selection stay native while the code shows colored (see
 * BlockRow.css `.pv-code-wrap`). Non-code (or plain) blocks render just the
 * textarea. */
export function BlockTextarea(props: BlockTextareaProps) {
  const { block, value, inputRef } = props;
  const textarea = (
    <textarea
      ref={inputRef}
      className="pv-block-input"
      aria-label="Block content"
      rows={1}
      value={value}
      placeholder={placeholderFor(block.type)}
      onFocus={props.onFocus as unknown as (e: FocusEvent<HTMLTextAreaElement>) => void}
      onChange={props.onChange}
      onBlur={props.onBlur}
      onKeyDown={props.onKeyDown}
      onSelect={props.onSelect}
      onPaste={props.onPaste}
    />
  );

  if (block.type === 'code' && block.lang) {
    return (
      <div className="pv-code-wrap">
        <CodeHighlight code={value} lang={block.lang} />
        {textarea}
      </div>
    );
  }
  return textarea;
}
