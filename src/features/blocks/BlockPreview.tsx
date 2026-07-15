import { type RefObject, type KeyboardEvent, type MouseEvent } from 'react';
import { FormattedText } from './FormattedText';

/** The idle, read-only view of a text block that has inline markup (bold/italic/
 * etc.): renders the formatted text and, on click, switches the block back to
 * its raw textarea for editing (focusing it next frame). Clicking a rendered
 * link or @mention follows it instead of entering edit mode. Split from
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
  const edit = () => {
    onEdit();
    requestAnimationFrame(() => inputRef.current?.focus());
  };
  // A click on a rendered link/mention should navigate, not flip to edit mode —
  // so ignore clicks whose target is inside an <a> (external link or mention).
  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    edit();
  };
  // role="button" needs keyboard activation (Enter/Space enters edit mode); a
  // key pressed on an inner link is left to the link.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      edit();
    }
  };

  return (
    <div
      className="pv-block-preview"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <FormattedText text={value} />
    </div>
  );
}
