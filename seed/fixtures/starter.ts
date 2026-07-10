import type { BlockType } from '../../src/lib/pbTypes';

/** The starter workspace seeded for the test user — DATA, not logic. Each page
 * has an icon + a list of blocks in order. */
export interface SeedBlock {
  type: BlockType;
  content: string;
  checked?: boolean;
}
export interface SeedPage {
  title: string;
  icon: string;
  blocks: SeedBlock[];
}

export const STARTER_PAGES: SeedPage[] = [
  {
    title: 'Welcome to PageVault',
    icon: '👋',
    blocks: [
      { type: 'heading', content: 'Your self-hosted workspace' },
      { type: 'text', content: 'Every page and block here lives in your own PocketBase.' },
      { type: 'subheading', content: 'Try it out' },
      { type: 'todo', content: 'Create a new page from the sidebar', checked: false },
      { type: 'todo', content: 'Add a few blocks and type in them', checked: false },
      { type: 'quote', content: 'You own your data — no cloud account required.' },
      { type: 'divider', content: '' },
      { type: 'subheading', content: 'Markdown shortcuts' },
      { type: 'text', content: 'Type these at the start of a block to transform it:' },
      { type: 'bullet', content: '“# ” → heading, “## ” → subheading' },
      { type: 'bullet', content: '“- ” → bullet, “1. ” → numbered list' },
      { type: 'bullet', content: '“[] ” → to-do, “> ” → quote, “``` ” → code' },
      { type: 'numbered', content: 'Press Enter to add the next block' },
      { type: 'numbered', content: 'Backspace on an empty block removes it' },
      { type: 'code', content: 'docker compose up -d   # your whole backend' },
    ],
  },
  {
    title: 'Reading list',
    icon: '📚',
    blocks: [
      { type: 'heading', content: 'Books to read' },
      { type: 'todo', content: 'The Pragmatic Programmer', checked: true },
      { type: 'todo', content: 'Designing Data-Intensive Applications', checked: false },
    ],
  },
];
