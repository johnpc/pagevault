import { describe, it, expect } from 'vitest';
import { mentionQuery, mentionToken, applyMention, mentionMatches } from './mention';
import type { PageRecord } from '../../lib/pbClient';

const pg = (id: string, title: string, over: Partial<PageRecord> = {}): PageRecord =>
  ({ id, title, archived: false, ...over }) as PageRecord;

describe('mentionQuery', () => {
  it('detects an @-query at the caret', () => {
    expect(mentionQuery('hi @tr', 6)).toEqual({ query: 'tr', start: 3, end: 6 });
  });

  it('detects an empty query right after @', () => {
    expect(mentionQuery('@', 1)).toEqual({ query: '', start: 0, end: 1 });
  });

  it('ignores an @ that is not at a word boundary (e.g. an email)', () => {
    expect(mentionQuery('mail@host', 9)).toBeNull();
  });

  it('ends the mention at a space', () => {
    expect(mentionQuery('@trip plan', 10)).toBeNull();
  });

  it('is null when there is no @ before the caret', () => {
    expect(mentionQuery('plain text', 5)).toBeNull();
  });
});

describe('mentionToken', () => {
  it('builds the @[title](id) token, falling back to Untitled', () => {
    expect(mentionToken(pg('a1', 'Trip'))).toBe('@[Trip](a1)');
    expect(mentionToken(pg('a2', ''))).toBe('@[Untitled](a2)');
  });
});

describe('applyMention', () => {
  it('replaces the @-query with the token and returns the caret after it', () => {
    const q = mentionQuery('see @tr', 7)!;
    const res = applyMention('see @tr', q, pg('a1', 'Trip'));
    expect(res.value).toBe('see @[Trip](a1)');
    expect(res.caret).toBe(res.value.length);
  });

  it('keeps trailing text after the caret intact', () => {
    const q = mentionQuery('@t done', 2)!;
    const res = applyMention('@t done', q, pg('x', 'Task'));
    expect(res.value).toBe('@[Task](x) done');
  });
});

describe('mentionMatches', () => {
  const pages = [pg('1', 'Trip plan'), pg('2', 'Travel'), pg('3', 'Notes'), pg('cur', 'Current')];

  it('filters by case-insensitive substring and excludes the current page', () => {
    const m = mentionMatches(pages, 'tr', 'cur');
    expect(m.map((p) => p.id)).toEqual(['1', '2']);
  });

  it('returns all (minus current + archived) for an empty query', () => {
    const withArchived = [...pages, pg('4', 'Old', { archived: true })];
    expect(mentionMatches(withArchived, '', 'cur').map((p) => p.id)).toEqual(['1', '2', '3']);
  });

  it('caps the result count', () => {
    const many = Array.from({ length: 10 }, (_, i) => pg(`${i}`, `Item ${i}`));
    expect(mentionMatches(many, 'item', 'none', 3)).toHaveLength(3);
  });
});
