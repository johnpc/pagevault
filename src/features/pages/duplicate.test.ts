import { describe, it, expect } from 'vitest';
import { duplicatePageFields, duplicateBlockFields } from './duplicate';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';

const page = (over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id: 'p1',
    title: 'Plan',
    icon: '🚀',
    archived: false,
    favorite: true,
    sort: 2,
    parent: 'root',
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'pages',
    ...over,
  }) as PageRecord;

const blk = (id: string, sort: number, over: Partial<BlockRecord> = {}): BlockRecord =>
  ({
    id,
    page: 'p1',
    type: 'text',
    content: id,
    checked: false,
    sort,
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
    ...over,
  }) as BlockRecord;

describe('duplicatePageFields', () => {
  it('appends "(copy)", keeps icon/parent, resets favorite/archived, appends sort', () => {
    const fields = duplicatePageFields(page(), [{ sort: 5 } as PageRecord], 'u1');
    expect(fields).toMatchObject({
      title: 'Plan (copy)',
      icon: '🚀',
      parent: 'root',
      favorite: false,
      archived: false,
      sort: 6,
      owner: 'u1',
    });
  });

  it('uses Untitled for a blank source title', () => {
    expect(duplicatePageFields(page({ title: '' }), [], 'u1').title).toBe('Untitled (copy)');
  });
});

describe('duplicateBlockFields', () => {
  it('reparents blocks to the new page in order with sequential sort', () => {
    const out = duplicateBlockFields([blk('b', 1), blk('a', 0, { type: 'heading' })], 'new1', 'u1');
    expect(out.map((b) => [b.page, b.content, b.sort])).toEqual([
      ['new1', 'a', 0],
      ['new1', 'b', 1],
    ]);
    expect(out[0].type).toBe('heading');
  });

  it('preserves the checked flag on todos', () => {
    const out = duplicateBlockFields([blk('t', 0, { type: 'todo', checked: true })], 'new1', 'u1');
    expect(out[0].checked).toBe(true);
  });
});
