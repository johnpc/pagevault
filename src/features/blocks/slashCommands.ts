import type { BlockType } from '../../lib/pbTypes';

/** A block type the slash menu can insert, with searchable keywords. */
export interface SlashCommand {
  type: BlockType;
  label: string;
  icon: string;
  keywords: string[];
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { type: 'text', label: 'Text', icon: '¶', keywords: ['text', 'paragraph', 'plain'] },
  { type: 'heading', label: 'Heading', icon: 'H1', keywords: ['heading', 'title', 'h1'] },
  {
    type: 'subheading',
    label: 'Subheading',
    icon: 'H2',
    keywords: ['subheading', 'h2', 'subtitle'],
  },
  { type: 'bullet', label: 'Bulleted list', icon: '•', keywords: ['bullet', 'unordered', 'list'] },
  {
    type: 'numbered',
    label: 'Numbered list',
    icon: '1.',
    keywords: ['numbered', 'ordered', 'list'],
  },
  { type: 'todo', label: 'To-do', icon: '☑', keywords: ['todo', 'task', 'checkbox', 'check'] },
  { type: 'quote', label: 'Quote', icon: '❝', keywords: ['quote', 'blockquote', 'cite'] },
  { type: 'code', label: 'Code', icon: '</>', keywords: ['code', 'snippet', 'mono'] },
  { type: 'image', label: 'Image', icon: '🖼', keywords: ['image', 'picture', 'photo', 'img'] },
  { type: 'callout', label: 'Callout', icon: '💡', keywords: ['callout', 'note', 'tip', 'info'] },
  {
    type: 'toggle',
    label: 'Toggle list',
    icon: '▸',
    keywords: ['toggle', 'collapse', 'collapsible', 'fold', 'expand'],
  },
  {
    type: 'table',
    label: 'Table',
    icon: '▦',
    keywords: ['table', 'database', 'grid', 'spreadsheet', 'db'],
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '—',
    keywords: ['divider', 'rule', 'separator', 'hr'],
  },
];

/**
 * If `value` is a slash query ("/" then an optional filter), return the matching
 * commands (label/keyword prefix match), else null (not in slash mode). Pure.
 */
export function slashMatches(value: string): SlashCommand[] | null {
  if (!value.startsWith('/')) return null;
  const query = value.slice(1).trim().toLowerCase();
  if (query === '') return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query) || cmd.keywords.some((k) => k.startsWith(query)),
  );
}
