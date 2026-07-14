import type { BlockType } from '../../lib/pbTypes';

/** Placeholder copy shown in an empty block, by type. Pure + tested. */
export function placeholderFor(type: BlockType): string {
  switch (type) {
    case 'heading':
      return 'Heading';
    case 'subheading':
      return 'Subheading';
    case 'subsubheading':
      return 'Sub-subheading';
    case 'todo':
      return 'To-do';
    case 'quote':
      return 'Quote';
    case 'bullet':
      return 'List item';
    case 'numbered':
      return 'List item';
    case 'code':
      return 'Code';
    case 'image':
      return 'Paste an image URL…';
    case 'callout':
      return 'Write a callout…';
    case 'toggle':
      return 'Toggle';
    case 'divider':
      return '';
    default:
      return "Type '/' for a block, or just start writing…";
  }
}

/** Order used when cycling a block's style via the toolbar button. */
export const TYPE_ORDER: BlockType[] = [
  'text',
  'heading',
  'subheading',
  'subsubheading',
  'bullet',
  'numbered',
  'todo',
  'quote',
  'callout',
  'toggle',
  'code',
  'image',
  'table',
  'columns',
  'toc',
  'divider',
];

/** The next type when a user cycles a block's style (toolbar button). */
export function cycleType(type: BlockType): BlockType {
  return TYPE_ORDER[(TYPE_ORDER.indexOf(type) + 1) % TYPE_ORDER.length];
}

/** Markdown prefixes that convert a text block as you type (Notion-style). */
const SHORTCUTS: { prefix: RegExp; type: BlockType }[] = [
  { prefix: /^# $/, type: 'heading' },
  { prefix: /^## $/, type: 'subheading' },
  { prefix: /^### $/, type: 'subsubheading' },
  { prefix: /^[-*] $/, type: 'bullet' },
  { prefix: /^1\. $/, type: 'numbered' },
  { prefix: /^\[\] $/, type: 'todo' },
  { prefix: /^\[ \] $/, type: 'todo' },
  { prefix: /^> $/, type: 'quote' },
  // Three backticks convert to a code block immediately (Notion behavior) — no
  // trailing space needed. The space variant also works for muscle memory.
  { prefix: /^```$/, type: 'code' },
  { prefix: /^``` $/, type: 'code' },
  { prefix: /^--- $/, type: 'divider' },
];

/**
 * If `value` is exactly a markdown prefix (e.g. "# " or "- "), return the block
 * type it should become and the remaining content (empty — the prefix is
 * consumed). Otherwise null. Pure, so it's trivially unit-tested.
 */
export function markdownShortcut(value: string): { type: BlockType; content: string } | null {
  for (const { prefix, type } of SHORTCUTS) {
    if (prefix.test(value)) return { type, content: '' };
  }
  return null;
}
