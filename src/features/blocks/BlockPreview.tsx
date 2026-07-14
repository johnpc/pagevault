import { type RefObject } from 'react';
import { FormattedText } from './FormattedText';

/** The idle, read-only view of a text block that has inline markup (bold/italic/
 * etc.): renders the formatted text and, on click, switches the block back to
 * its raw textarea for editing (focusing it next frame). Split from
 * TextBlockBody to keep that component small. */
export function BlockPreview({
  value,
  onEdit,
  inputRef,
}: {
  value: string;
  onEdit: () => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div
      className="pv-block-preview"
      role="button"
      tabIndex={0}
      onClick={() => {
        onEdit();
        requestAnimationFrame(() => inputRef.current?.focus());
      }}
    >
      <FormattedText text={value} />
    </div>
  );
}
