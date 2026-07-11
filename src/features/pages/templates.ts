import { pb, currentUserId } from '../../lib/pbClient';
import type { PageRecord } from '../../lib/pbClient';
import { nextSort } from './pageTree';
import type { BlockType } from '../../lib/pbTypes';

/** A preset block within a template — DATA. */
export interface TemplateBlock {
  type: BlockType;
  content: string;
  checked?: boolean;
}

/** A starter page layout offered on the Home screen. */
export interface Template {
  id: string;
  label: string;
  icon: string;
  title: string;
  blocks: TemplateBlock[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'blank',
    label: 'Blank',
    icon: '📄',
    title: '',
    blocks: [{ type: 'text', content: '' }],
  },
  {
    id: 'meeting',
    label: 'Meeting notes',
    icon: '📝',
    title: 'Meeting notes',
    blocks: [
      { type: 'heading', content: 'Meeting notes' },
      { type: 'text', content: 'Date: ' },
      { type: 'text', content: 'Attendees: ' },
      { type: 'subheading', content: 'Agenda' },
      { type: 'bullet', content: '' },
      { type: 'subheading', content: 'Action items' },
      { type: 'todo', content: '', checked: false },
    ],
  },
  {
    id: 'todo',
    label: 'To-do list',
    icon: '✅',
    title: 'To-do list',
    blocks: [
      { type: 'heading', content: 'To-do list' },
      { type: 'todo', content: '', checked: false },
      { type: 'todo', content: '', checked: false },
      { type: 'todo', content: '', checked: false },
    ],
  },
];

/** The template with the given id, or null. Pure. */
export function findTemplate(id: string): Template | null {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

/** Create a new page from a template + its preset blocks. Returns the new id. */
export async function runTemplate(template: Template, siblings: PageRecord[]): Promise<string> {
  const owner = currentUserId();
  const page = await pb
    .collection('pages')
    .create<PageRecord>({ title: template.title, parent: '', sort: nextSort(siblings), owner });
  await Promise.all(
    template.blocks.map((b, sort) =>
      pb.collection('blocks').create({
        page: page.id,
        type: b.type,
        content: b.content,
        checked: b.checked ?? false,
        sort,
        owner,
      }),
    ),
  );
  return page.id;
}
