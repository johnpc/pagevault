/** A documented keyboard shortcut / editor gesture — DATA for the help overlay. */
export interface Shortcut {
  keys: string;
  action: string;
}

export const SHORTCUTS: Shortcut[] = [
  { keys: '⌘K / Ctrl+K', action: 'Open quick find (search pages & content)' },
  { keys: '⌘\\ / Ctrl+\\', action: 'Show or hide the sidebar' },
  { keys: '?', action: 'Show this shortcut help' },
  { keys: 'Esc', action: 'Close a menu, or leave edit mode in a block' },
  { keys: '/', action: 'Open the block-type menu (anywhere on a line, not just the start)' },
  { keys: '# ', action: 'Turn a block into a heading (## for subheading)' },
  { keys: '- ', action: 'Bulleted list ( 1. for numbered, [] for to-do )' },
  { keys: '> ', action: 'Quote block ( ``` for code, --- for divider )' },
  { keys: '**text**', action: 'Bold (  *text* italic,  `text` inline code )' },
  {
    keys: '⌘B / I / E / U',
    action: 'Wrap selection: bold / italic / code / underline ( ⇧⌘S strikethrough )',
  },
  { keys: '⇧↑ / ⇧↓', action: 'Grow a multi-block selection up / down' },
  { keys: '⌘A / Ctrl+A', action: 'Select all blocks ( Shift+Click, or a ⋮⋮ handle, also select )' },
  { keys: '⌘D / Ctrl+D', action: 'Duplicate the current block (or a whole block selection)' },
  { keys: '⌘C / ⌘X', action: 'With blocks selected: copy / cut them as Markdown' },
  { keys: 'Tab / ⇧Tab', action: 'Indent / outdent the block (nest it under the one above)' },
  { keys: '⌘⇧↑ / ↓', action: 'Move the current block up / down' },
  { keys: '⌘Z / ⌘⇧Z', action: 'Undo / redo a block edit' },
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
