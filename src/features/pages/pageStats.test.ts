import { describe, it, expect } from 'vitest';
import { pageStats, countWords, relativeTime, todoProgress } from './pageStats';
import type { BlockRecord } from '../../lib/pbClient';

const blk = (content: string): BlockRecord =>
  ({
    id: 'b',
    page: 'p',
    type: 'text',
    content,
    checked: false,
    sort: 0,
    owner: 'u',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
  }) as BlockRecord;

describe('countWords', () => {
  it('counts whitespace-delimited words', () => {
    expect(countWords('the quick brown fox')).toBe(4);
  });
  it('is 0 for blank/whitespace', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });
  it('collapses runs of whitespace', () => {
    expect(countWords('a   b\n c')).toBe(3);
  });
});

describe('pageStats', () => {
  it('sums words across blocks and counts blocks', () => {
    expect(pageStats([blk('hello world'), blk('one'), blk('')])).toEqual({ words: 3, blocks: 3 });
  });
});

describe('relativeTime', () => {
  const base = Date.parse('2026-01-01T12:00:00Z');
  it('says just now for < 1 minute', () => {
    expect(relativeTime('2026-01-01T11:59:30Z', base)).toBe('just now');
  });
  it('pluralizes minutes, hours, days', () => {
    expect(relativeTime('2026-01-01T11:59:00Z', base)).toBe('1 minute ago');
    expect(relativeTime('2026-01-01T11:00:00Z', base)).toBe('1 hour ago');
    expect(relativeTime('2025-12-30T12:00:00Z', base)).toBe('2 days ago');
  });
  it('returns empty for an invalid timestamp', () => {
    expect(relativeTime('not-a-date', base)).toBe('');
  });
});

describe('todoProgress', () => {
  const todo = (checked: boolean): BlockRecord =>
    ({ ...blk(''), type: 'todo', checked }) as BlockRecord;

  it('counts checked todos out of the total, ignoring non-todos', () => {
    expect(todoProgress([todo(true), todo(false), todo(true), blk('text')])).toEqual({
      done: 2,
      total: 3,
    });
  });
  it('reports zero total when there are no todos', () => {
    expect(todoProgress([blk('a'), blk('b')])).toEqual({ done: 0, total: 0 });
  });
});
