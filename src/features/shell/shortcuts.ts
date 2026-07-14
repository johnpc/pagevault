/** A documented keyboard shortcut / editor gesture — DATA for the help overlay. */
export interface Shortcut {
  keys: string;
  action: string;
}

export const SHORTCUTS: Shortcut[] = [
  { keys: '⌘K / Ctrl+K', action: 'Open quick find (search pages & content)' },
  { keys: '⌘\\ / Ctrl+\\', action: 'Show or hide the sidebar' },
  { keys: '?', action: 'Show this shortcut help' },
  { keys: 'Esc', action: 'Close a dialog or menu' },
  { keys: '/', action: 'Open the block-type menu in an empty block' },
  { keys: '# ', action: 'Turn a block into a heading (## for subheading)' },
  { keys: '- ', action: 'Bulleted list ( 1. for numbered, [] for to-do )' },
  { keys: '> ', action: 'Quote block ( ``` for code, --- for divider )' },
  { keys: '**text**', action: 'Bold (  *text* italic,  `text` inline code )' },
  {
    keys: '⌘B / I / E / U',
    action: 'Wrap selection: bold / italic / code / underline ( ⇧⌘S strikethrough )',
  },
  { keys: '⌘D / Ctrl+D', action: 'Duplicate the current block' },
  { keys: '⌘⇧↑ / ↓', action: 'Move the current block up / down' },
  { keys: 'Enter', action: 'Add a new block below' },
  { keys: '↑ / ↓', action: 'Move the caret to the block above / below (at a block edge)' },
  {
    keys: 'Backspace',
    action: 'Delete an empty block, or merge into the block above (at its start)',
  },
  { keys: 'Delete', action: 'Merge the next block up into this one (at its end)' },
  { keys: 'Enter / ↑ ↓', action: 'In a table: move between cells (Tab moves across)' },
];

/** True when a keypress originated in an editable field (so global single-key
 * shortcuts like "?" shouldn't hijack it). Pure — takes the event target. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable === true;
}
