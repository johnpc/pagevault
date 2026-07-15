import type { ClipboardEvent } from 'react';
import { looksLikeMarkdown } from './markdownImport';
import { linkOnPaste } from './linkOnPaste';
import { clipboardImage } from './clipboardImage';

interface PasteHandlers {
  setValue: (v: string) => void;
  onPasteMarkdown: (text: string) => void;
  /** Paste a clipboard image into an empty block (convert it + upload the file). */
  onPasteImage: (file: File) => void;
}

/**
 * Build the textarea paste handler for a text block. Special cases, else the
 * browser pastes normally:
 *   1. An image on the clipboard, into an empty block → make it an image block.
 *   2. A bare URL pasted over a selection → wrap it as a markdown link
 *      `[selected](url)` (skipped in code blocks, whose contents are literal).
 *   3. Markdown-y text pasted into an empty block → import it as blocks.
 */
export function useBlockPaste(isCode: boolean, value: string, h: PasteHandlers) {
  return (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const image = value === '' && !isCode ? clipboardImage(e.clipboardData) : null;
    if (image) {
      e.preventDefault();
      h.onPasteImage(image);
      return;
    }
    const text = e.clipboardData.getData('text/plain');
    const linked = isCode ? null : linkOnPaste(value, el.selectionStart, el.selectionEnd, text);
    if (linked) {
      e.preventDefault();
      h.setValue(linked.value);
      requestAnimationFrame(() => el.setSelectionRange(linked.caret, linked.caret));
      return;
    }
    if (value === '' && looksLikeMarkdown(text)) {
      e.preventDefault();
      h.onPasteMarkdown(text);
    }
  };
}
