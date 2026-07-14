import { useEffect, useRef, type KeyboardEvent } from 'react';
import { contentToEditableHtml } from './wysiwygHtml';
import { domToContent } from './domToContent';

/**
 * A contentEditable inline editor that renders marks (bold/italic/…) live — the
 * WYSIWYG surface (RFC Stage 3), flag-gated so the default textarea path is
 * untouched. UNCONTROLLED: the DOM is seeded from `value` only when `value`
 * changes while the field is NOT focused (a realtime/external update), never on
 * every keystroke — so React never re-renders the content out from under the
 * caret. On input we read the DOM back to the canonical content string and call
 * onChange; the parent persists it but must NOT push it back mid-focus.
 */
export function WysiwygInput({
  value,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
}: {
  value: string;
  placeholder: string;
  onChange: (content: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const focused = useRef(false);

  // Seed the editable DOM from external content, but only while unfocused so the
  // caret is never yanked mid-edit (mirrors useReconciled's rule for textareas).
  useEffect(() => {
    const el = ref.current;
    if (!el || focused.current) return;
    const html = contentToEditableHtml(value);
    if (el.innerHTML !== html) el.innerHTML = html;
  }, [value]);

  return (
    <div
      ref={ref}
      className="pv-block-input pv-wysiwyg"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Block content"
      aria-multiline="true"
      data-placeholder={placeholder}
      onFocus={() => {
        focused.current = true;
        onFocus();
      }}
      onBlur={() => {
        focused.current = false;
        if (ref.current) onChange(domToContent(ref.current));
        onBlur();
      }}
      onInput={() => {
        if (ref.current) onChange(domToContent(ref.current));
      }}
      onKeyDown={onKeyDown}
    />
  );
}
