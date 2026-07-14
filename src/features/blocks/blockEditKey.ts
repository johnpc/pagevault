import type { KeyboardEvent } from 'react';
import { edgeArrowDir, focusAdjacentBlock } from './arrowNav';

interface EditKeyDeps {
  value: string;
  onIndent: (dir: 'in' | 'out') => void;
  onEnter: (caret: number, value: string) => boolean;
  onRemove: () => void;
  /** Merge this block into the one above (Backspace at the very start).
   * Returns true when it merged, so the default is prevented. */
  onMerge: () => boolean;
  setValue: (v: string) => void;
}

/** Build the block textarea's structural key handler: Tab indents, Enter splits
 * into a new block, Backspace-on-empty removes, and a plain arrow at a block
 * edge moves the caret to the adjacent block. Factored out of useBlockInput so
 * both stay under the line limit and each key rule is independently testable. */
export function makeEditKey(deps: EditKeyDeps) {
  const { value, onIndent, onEnter, onRemove, onMerge, setValue } = deps;

  // Backspace at the very start of a block: merge into the block above (Notion).
  // Only for a collapsed caret at offset 0; otherwise let the textarea delete a
  // character. Returns true when it handled the key.
  const backspaceKey = (e: KeyboardEvent<HTMLTextAreaElement>): boolean => {
    if (value === '') {
      e.preventDefault();
      onRemove();
      return true;
    }
    const el = e.currentTarget;
    if (el.selectionStart === 0 && el.selectionEnd === 0 && onMerge()) {
      e.preventDefault();
      return true;
    }
    return false;
  };

  const enterKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const caret = e.currentTarget.selectionStart;
    if (!onEnter(caret, value)) return;
    e.preventDefault();
    // Keep local state in sync with the trimmed source so the follow-on blur
    // save doesn't clobber the split with the pre-split value.
    setValue(value.slice(0, caret));
  };

  const arrowKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const dir = edgeArrowDir(e, el.value, el.selectionStart, el.selectionEnd);
    if (dir !== null && focusAdjacentBlock(el, dir)) e.preventDefault();
  };

  return (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onIndent(e.shiftKey ? 'out' : 'in');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      enterKey(e);
    } else if (e.key === 'Backspace') {
      backspaceKey(e);
    } else {
      arrowKey(e);
    }
  };
}
