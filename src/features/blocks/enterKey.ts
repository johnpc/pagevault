import type { BlockRecord } from '../../lib/pbClient';
import type { BlockType } from '../../lib/pbTypes';

/** List-style blocks that continue themselves when you press Enter. */
const LIST_TYPES: BlockType[] = ['bullet', 'numbered', 'todo'];
const isList = (type: BlockType) => LIST_TYPES.includes(type);

/**
 * What pressing Enter should do, computed purely from the block + caret. Notion
 * behavior: split the text at the caret into a new block right below, continue
 * lists, exit/outdent an empty list item, and keep newlines inside code.
 */
export type EnterAction =
  | { kind: 'newline' } // code block — let the textarea insert a real newline
  | { kind: 'outdent' } // empty, indented list item — pop out one level
  | { kind: 'exit-list' } // empty, top-level list item — become a paragraph
  | { kind: 'split'; before: string; after: string; type: BlockType; depth: number };

/**
 * Decide the Enter behavior for `block` when the caret sits at `caret` in the
 * live `value`. Pure + total, so it's trivially unit-testable.
 */
export function enterAction(block: BlockRecord, caret: number, value: string): EnterAction {
  if (block.type === 'code') return { kind: 'newline' };

  const depth = block.depth ?? 0;
  if (isList(block.type) && value.trim() === '') {
    return depth > 0 ? { kind: 'outdent' } : { kind: 'exit-list' };
  }

  const before = value.slice(0, caret);
  const after = value.slice(caret);
  // Lists continue as the same type; splitting mid-content keeps the type; but
  // pressing Enter at the END of a heading/quote/etc. starts a plain paragraph.
  const type: BlockType = isList(block.type) || after !== '' ? block.type : 'text';
  return { kind: 'split', before, after, type, depth };
}
