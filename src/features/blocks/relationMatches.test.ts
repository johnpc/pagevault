import { describe, it, expect } from 'vitest';
import { relationMatches } from './relationMatches';
import type { PageRecord } from '../../lib/pbClient';

const p = (id: string, title: string, archived = false): PageRecord =>
  ({ id, title, archived }) as PageRecord;

const pages = [p('1', 'Roadmap'), p('2', 'Recipes'), p('3', 'Old', true)];

describe('relationMatches', () => {
  it('returns all non-archived pages for an empty query', () => {
    expect(relationMatches(pages, '').map((x) => x.id)).toEqual(['1', '2']);
    expect(relationMatches(pages, '   ').map((x) => x.id)).toEqual(['1', '2']);
  });

  it('filters by a case-insensitive title substring', () => {
    expect(relationMatches(pages, 'road').map((x) => x.id)).toEqual(['1']);
    expect(relationMatches(pages, 'RE').map((x) => x.id)).toEqual(['2']);
  });

  it('never includes an archived page', () => {
    expect(relationMatches(pages, 'old')).toEqual([]);
  });
});
