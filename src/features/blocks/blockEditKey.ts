import type { KeyboardEvent } from 'react';
import { edgeArrowDir, focusAdjacentBlock } from './arrowNav';

interface EditKeyDeps {
  value: string;
  /** True for a code block, where Tab inserts spaces instead of indenting. */
  isCode: boolean;
  onIndent: (dir: 'in' | 'out') => void;
  onEnter: (caret: number, value: string) => boolean;
  onRemove: () => void;
  /** Merge this block into the one above (Backspace at the very start).
   * Returns true when it merged, so the default is prevented. */
  onMerge: () => boolean;
  /** Pull the next block up into this one (Delete at the very end).
   * Returns true when it merged, so the default is prevented. */
  onMergeForward: () => boolean;
  setValue: (v: string) => void;
}

type Evt = KeyboardEvent<HTMLTextAreaElement>;

// Backspace: delete an empty block, or (at offset 0 of a non-empty block) merge
// into the block above. Otherwise let the textarea delete a character.
function backspaceKey(e: Evt, d: EditKeyDeps) {
  if (d.value === '') {
    e.preventDefault();
    d.onRemove();
    return;
  }
  const el = e.currentTarget;
  if (el.selectionStart === 0 && el.selectionEnd === 0 && d.onMerge()) e.preventDefault();
}

// Delete at the very end of a block: pull the next block up into this one.
function deleteKey(e: Evt, d: EditKeyDeps) {
  const el = e.currentTarget;
  const atEnd = el.selectionStart === d.value.length && el.selectionEnd === d.value.length;
  if (atEnd && d.onMergeForward()) e.preventDefault();
}

// Enter splits at the caret into a new block below (unless onEnter declines,
// e.g. inside code — then the real newline goes through).
function enterKey(e: Evt, d: EditKeyDeps) {
  const caret = e.currentTarget.selectionStart;
  if (!d.onEnter(caret, d.value)) return;
  e.preventDefault();
  // Keep local state in sync with the trimmed source so the follow-on blur save
  // doesn't clobber the split with the pre-split value.
  d.setValue(d.value.slice(0, caret));
}

// Tab inside a code block inserts two spaces at the caret (real code indent),
// replacing any selection, and restores the caret after them. Shift+Tab is left
// to the browser (a code block has no block-outdent meaning).
function tabInCode(e: Evt, d: EditKeyDeps) {
  if (e.shiftKey) return;
  e.preventDefault();
  const el = e.currentTarget;
  const { selectionStart: s, selectionEnd: en } = el;
  const next = d.value.slice(0, s) + '  ' + d.value.slice(en);
  d.setValue(next);
  requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
}

// A plain arrow at a block edge moves the caret to the adjacent block.
function arrowKey(e: Evt) {
  const el = e.currentTarget;
  const dir = edgeArrowDir(e, el.value, el.selectionStart, el.selectionEnd);
  if (dir !== null && focusAdjacentBlock(el, dir)) e.preventDefault();
}

/** Build the block textarea's structural key handler: Tab indents, Enter splits,
 * Backspace/Delete merge or remove, and an edge arrow moves between blocks. Each
 * rule is a module-level function (independently testable); this just dispatches
 * by key. Factored out of useBlockInput so both stay small. */
export function makeEditKey(deps: EditKeyDeps) {
  return (e: Evt) => {
    if (e.key === 'Tab') {
      if (deps.isCode) return tabInCode(e, deps);
      e.preventDefault();
      deps.onIndent(e.shiftKey ? 'out' : 'in');
    } else if (e.key === 'Enter' && !e.shiftKey) enterKey(e, deps);
    else if (e.key === 'Escape')
      e.currentTarget.blur(); // commit + leave edit (menus consume Esc first)
    else if (e.key === 'Backspace') backspaceKey(e, deps);
    else if (e.key === 'Delete') deleteKey(e, deps);
    else arrowKey(e);
  };
}
