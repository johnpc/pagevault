import { describe, it, expect } from 'vitest';
import { mentionMarker, buildBacklinks } from './backlinkGroups';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';

const pg = (id: string, title: string, over: Partial<PageRecord> = {}): PageRecord =>
  ({ id, title, archived: false, icon: '', ...over }) as PageRecord;
const blk = (id: string, page: string, content: string): BlockRecord =>
  ({ id, page, content }) as BlockRecord;

describe('mentionMarker', () => {
  it('is the ](id) tail of a mention token', () => {
    expect(mentionMarker('abc123')).toBe('](abc123)');
  });
});

describe('buildBacklinks', () => {
  const pages = new Map([
    ['src1', pg('src1', 'Journal')],
    ['src2', pg('src2', 'Archive', { archived: true })],
    ['target', pg('target', 'Roadmap')],
  ]);

  it('groups mentioning blocks by their source page, ordered by title', () => {
    const blocks = [
      blk('b1', 'src1', 'see @[Roadmap](target) today'),
      blk('b2', 'src1', 'again @[Roadmap](target)'),
    ];
    const links = buildBacklinks('target', blocks, pages);
    expect(links).toHaveLength(1);
    expect(links[0].page.id).toBe('src1');
    expect(links[0].snippets).toHaveLength(2);
  });

  it('drops self-mentions (blocks on the target page itself)', () => {
    const blocks = [blk('b1', 'target', 'links to @[Roadmap](target)')];
    expect(buildBacklinks('target', blocks, pages)).toEqual([]);
  });

  it('drops blocks whose page is archived or unknown', () => {
    const blocks = [
      blk('b1', 'src2', '@[Roadmap](target)'), // archived page
      blk('b2', 'ghost', '@[Roadmap](target)'), // unknown page
    ];
    expect(buildBacklinks('target', blocks, pages)).toEqual([]);
  });

  it('orders multiple source pages by title', () => {
    const many = new Map([
      ['z', pg('z', 'Zebra')],
      ['a', pg('a', 'Apple')],
    ]);
    const blocks = [blk('b1', 'z', '@[X](t)'), blk('b2', 'a', '@[X](t)')];
    expect(buildBacklinks('t', blocks, many).map((l) => l.page.title)).toEqual(['Apple', 'Zebra']);
  });
});
