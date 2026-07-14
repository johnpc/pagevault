import type { ClipboardEvent } from 'react';
import { looksLikeMarkdown } from './markdownImport';
import { linkOnPaste } from './linkOnPaste';

/**
 * Build the textarea paste handler for a text block. Two special cases, else the
 * browser pastes normally:
 *   1. A bare URL pasted over a selection → wrap it as a markdown link
 *      `[selected](url)` (skipped in code blocks, whose contents are literal).
 *   2. Markdown-y text pasted into an empty block → import it as blocks.
 */
export function useBlockPaste(
  isCode: boolean,
  value: string,
  setValue: (v: string) => void,
  onPasteMarkdown: (text: string) => void,
) {
  return (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text/plain');
    const el = e.currentTarget;
    const linked = isCode ? null : linkOnPaste(value, el.selectionStart, el.selectionEnd, text);
    if (linked) {
      e.preventDefault();
      setValue(linked.value);
      requestAnimationFrame(() => el.setSelectionRange(linked.caret, linked.caret));
      return;
    }
    if (value === '' && looksLikeMarkdown(text)) {
      e.preventDefault();
      onPasteMarkdown(text);
    }
  };
}
