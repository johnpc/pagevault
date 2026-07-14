import type {
  RefObject,
  ChangeEvent,
  KeyboardEvent,
  ClipboardEvent,
  ReactEventHandler,
} from 'react';
import type { BlockRecord } from '../../lib/pbClient';
import { placeholderFor } from './blockText';
import { BlockTextarea } from './BlockTextarea';
import { WysiwygInput } from './WysiwygInput';

/** Flag: opt into the contentEditable WYSIWYG surface (RFC Stage 3). Off by
 * default, so the proven textarea path is the shipped behavior until WYSIWYG is
 * at parity (caret, mention, slash). */
const WYSIWYG = import.meta.env.VITE_WYSIWYG === '1';

/** The editable surface for a text block: the WYSIWYG contentEditable when the
 * flag is on (and it's not a code block — code keeps the monospace textarea +
 * highlight), else the textarea. Bridges the WYSIWYG content-string onChange to
 * the shared changeValue so both surfaces run identical edit logic. */
export function BlockEditable(props: {
  block: BlockRecord;
  value: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onFocus: () => void;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSelect: ReactEventHandler<HTMLTextAreaElement>;
  onPaste: (e: ClipboardEvent<HTMLTextAreaElement>) => void;
}) {
  if (WYSIWYG && props.block.type !== 'code') {
    // Adapt the WYSIWYG content-string change to the shared ChangeEvent handler
    // (only .target.value is read there) so both surfaces run identical logic.
    return (
      <WysiwygInput
        value={props.value}
        placeholder={placeholderFor(props.block.type)}
        onChange={(content) =>
          props.onChange({ target: { value: content } } as ChangeEvent<HTMLTextAreaElement>)
        }
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown as unknown as (e: KeyboardEvent<HTMLDivElement>) => void}
      />
    );
  }
  return <BlockTextarea {...props} />;
}
