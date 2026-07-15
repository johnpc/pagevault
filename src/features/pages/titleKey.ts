/** Whether a keypress in the page title should hand off to the first block:
 * Enter (a title is single-line, so Enter never inserts a newline), or ↓ when
 * the caret is at the end of the title text. Pure — unit-testable. */
export function titleKeyLeaves(key: string, atEnd: boolean): boolean {
  return key === 'Enter' || (key === 'ArrowDown' && atEnd);
}
