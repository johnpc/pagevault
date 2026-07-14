import type { KeyboardEvent } from 'react';
import { edgeArrowDir, focusAdjacentBlock } from './arrowNav';

interface EditKeyDeps {
  value: string;
  onIndent: (dir: 'in' | 'out') => void;
  onEnter: (caret: number, value: string) => boolean;
  onRemove: () => void;
  setValue: (v: string) => void;
}

/** Build the block textarea's structural key handler: Tab indents, Enter splits
 * into a new block, Backspace-on-empty removes, and a plain arrow at a block
 * edge moves the caret to the adjacent block. Factored out of useBlockInput so
 * both stay under the line limit and each key rule is independently testable. */
export function makeEditKey(deps: EditKeyDeps) {
  const { value, onIndent, onEnter, onRemove, setValue } = deps;

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
    } else if (e.key === 'Backspace' && value === '') {
      e.preventDefault();
      onRemove();
    } else {
      arrowKey(e);
    }
  };
}
