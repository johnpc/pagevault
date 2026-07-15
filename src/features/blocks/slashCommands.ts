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
  {
    type: 'subsubheading',
    label: 'Sub-subheading',
    icon: 'H3',
    keywords: ['subsubheading', 'h3', 'heading 3'],
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
    type: 'columns',
    label: 'Columns',
    icon: '▥',
    keywords: ['columns', 'column', 'layout', 'side', 'grid'],
  },
  {
    type: 'toc',
    label: 'Table of contents',
    icon: '≣',
    keywords: ['toc', 'table of contents', 'outline', 'contents', 'headings'],
  },
  {
    type: 'bookmark',
    label: 'Bookmark',
    icon: '🔖',
    keywords: ['bookmark', 'link', 'url', 'web'],
  },
  {
    type: 'embed',
    label: 'Video / audio',
    icon: '🎬',
    keywords: ['embed', 'video', 'audio', 'youtube', 'vimeo', 'media', 'mp4', 'mp3'],
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '—',
    keywords: ['divider', 'rule', 'separator', 'hr'],
  },
];

/**
 * The commands matching a slash query (the text after '/', without the slash):
 * everything for an empty query, else a label-substring or keyword-prefix match.
 * Pure. Shared by the start-of-line and mid-line slash paths.
 */
export function filterCommands(query: string): SlashCommand[] {
  const q = query.trim().toLowerCase();
  if (q === '') return SLASH_COMMANDS;
  return SLASH_COMMANDS.filter(
    (cmd) => cmd.label.toLowerCase().includes(q) || cmd.keywords.some((k) => k.startsWith(q)),
  );
}
