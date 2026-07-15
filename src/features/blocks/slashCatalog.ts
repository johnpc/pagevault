import type { BlockType } from '../../lib/pbTypes';

/** The section a command belongs to in the slash menu (Notion-style grouping).
 * Ordering of the union defines section order; commands stay grouped by keeping
 * same-group entries contiguous in SLASH_COMMANDS. */
export type SlashGroup = 'Basic' | 'Media' | 'Advanced';

/** A block type the slash menu can insert, with searchable keywords + group. */
export interface SlashCommand {
  type: BlockType;
  label: string;
  icon: string;
  keywords: string[];
  group: SlashGroup;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    type: 'text',
    label: 'Text',
    icon: '¶',
    keywords: ['text', 'paragraph', 'plain'],
    group: 'Basic',
  },
  {
    type: 'heading',
    label: 'Heading',
    icon: 'H1',
    keywords: ['heading', 'title', 'h1'],
    group: 'Basic',
  },
  {
    type: 'subheading',
    label: 'Subheading',
    icon: 'H2',
    keywords: ['subheading', 'h2', 'subtitle'],
    group: 'Basic',
  },
  {
    type: 'subsubheading',
    label: 'Sub-subheading',
    icon: 'H3',
    keywords: ['subsubheading', 'h3', 'heading 3'],
    group: 'Basic',
  },
  {
    type: 'bullet',
    label: 'Bulleted list',
    icon: '•',
    keywords: ['bullet', 'unordered', 'list'],
    group: 'Basic',
  },
  {
    type: 'numbered',
    label: 'Numbered list',
    icon: '1.',
    keywords: ['numbered', 'ordered', 'list'],
    group: 'Basic',
  },
  {
    type: 'todo',
    label: 'To-do',
    icon: '☑',
    keywords: ['todo', 'task', 'checkbox', 'check'],
    group: 'Basic',
  },
  {
    type: 'quote',
    label: 'Quote',
    icon: '❝',
    keywords: ['quote', 'blockquote', 'cite'],
    group: 'Basic',
  },
  {
    type: 'code',
    label: 'Code',
    icon: '</>',
    keywords: ['code', 'snippet', 'mono'],
    group: 'Basic',
  },
  {
    type: 'callout',
    label: 'Callout',
    icon: '💡',
    keywords: ['callout', 'note', 'tip', 'info'],
    group: 'Basic',
  },
  {
    type: 'image',
    label: 'Image',
    icon: '🖼',
    keywords: ['image', 'picture', 'photo', 'img'],
    group: 'Media',
  },
  {
    type: 'bookmark',
    label: 'Bookmark',
    icon: '🔖',
    keywords: ['bookmark', 'link', 'url', 'web'],
    group: 'Media',
  },
  {
    type: 'embed',
    label: 'Video / audio',
    icon: '🎬',
    keywords: ['embed', 'video', 'audio', 'youtube', 'vimeo', 'media', 'mp4', 'mp3'],
    group: 'Media',
  },
  {
    type: 'toggle',
    label: 'Toggle list',
    icon: '▸',
    keywords: ['toggle', 'collapse', 'collapsible', 'fold', 'expand'],
    group: 'Advanced',
  },
  {
    type: 'table',
    label: 'Table',
    icon: '▦',
    keywords: ['table', 'database', 'grid', 'spreadsheet', 'db'],
    group: 'Advanced',
  },
  {
    type: 'columns',
    label: 'Columns',
    icon: '▥',
    keywords: ['columns', 'column', 'layout', 'side', 'grid'],
    group: 'Advanced',
  },
  {
    type: 'toc',
    label: 'Table of contents',
    icon: '≣',
    keywords: ['toc', 'table of contents', 'outline', 'contents', 'headings'],
    group: 'Advanced',
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '—',
    keywords: ['divider', 'rule', 'separator', 'hr'],
    group: 'Advanced',
  },
];
