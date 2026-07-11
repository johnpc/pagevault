import { describe, it, expect } from 'vitest';
import { mergeResults, snippetAround, nextActiveIndex } from './searchResults';
import type { PageRecord, BlockRecord } from '../../lib/pbClient';

const page = (id: string, over: Partial<PageRecord> = {}): PageRecord =>
  ({
    id,
    title: id,
    icon: '',
    archived: false,
    sort: 0,
    parent: '',
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'pages',
    ...over,
  }) as PageRecord;

const block = (id: string, pageId: string, content: string): BlockRecord =>
  ({
    id,
    page: pageId,
    type: 'text',
    content,
    checked: false,
    sort: 0,
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
  }) as BlockRecord;

describe('snippetAround', () => {
  it('returns context around the match with ellipses', () => {
    const s = snippetAround('the quick brown fox jumps over the lazy dog', 'fox', 5);
    expect(s).toContain('fox');
    expect(s.startsWith('…')).toBe(true);
    expect(s.endsWith('…')).toBe(true);
  });
  it('handles no match by returning a prefix', () => {
    expect(snippetAround('hello world', 'zzz', 3)).toBe('hello ');
  });
  it('is case-insensitive', () => {
    expect(snippetAround('Hello World', 'world', 2)).toContain('World');
  });
});

describe('mergeResults', () => {
  it('lists title matches first, then block matches for other pages', () => {
    const pages = [page('p1', { title: 'Roadmap', icon: '🚀' })];
    const blocks = [block('b1', 'p2', 'discuss the roadmap timeline')];
    const map = new Map([
      ['p1', page('p1', { title: 'Roadmap' })],
      ['p2', page('p2', { title: 'Meeting' })],
    ]);
    const results = mergeResults('roadmap', pages, blocks, map);
    expect(results.map((r) => [r.pageId, r.kind])).toEqual([
      ['p1', 'title'],
      ['p2', 'block'],
    ]);
    expect(results[1].snippet).toContain('roadmap');
  });

  it('does not duplicate a page that matched by title AND block', () => {
    const pages = [page('p1', { title: 'Roadmap' })];
    const blocks = [block('b1', 'p1', 'roadmap notes')];
    const map = new Map([['p1', page('p1', { title: 'Roadmap' })]]);
    expect(mergeResults('roadmap', pages, blocks, map)).toHaveLength(1);
  });

  it('skips block hits whose page is missing or archived', () => {
    const blocks = [block('b1', 'gone', 'x'), block('b2', 'arch', 'x')];
    const map = new Map([['arch', page('arch', { archived: true })]]);
    expect(mergeResults('x', [], blocks, map)).toHaveLength(0);
  });

  it('ranks title hits: exact, then prefix, then substring', () => {
    const pages = [
      page('sub', { title: 'crossroad' }), // substring
      page('exact', { title: 'road' }), // exact
      page('prefix', { title: 'roadmap' }), // prefix
    ];
    const map = new Map(pages.map((p) => [p.id, p]));
    const results = mergeResults('road', pages, [], map);
    expect(results.map((r) => r.pageId)).toEqual(['exact', 'prefix', 'sub']);
  });
});

describe('nextActiveIndex', () => {
  it('moves down and wraps to the top', () => {
    expect(nextActiveIndex(0, 3, 'down')).toBe(1);
    expect(nextActiveIndex(2, 3, 'down')).toBe(0);
  });
  it('moves up and wraps to the bottom', () => {
    expect(nextActiveIndex(1, 3, 'up')).toBe(0);
    expect(nextActiveIndex(0, 3, 'up')).toBe(2);
  });
  it('is a no-op for an empty list', () => {
    expect(nextActiveIndex(0, 0, 'down')).toBe(0);
  });
});
