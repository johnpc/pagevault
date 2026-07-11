import { describe, it, expect } from 'vitest';
import { highlightParts, titleRank } from './highlight';

describe('highlightParts', () => {
  it('marks a case-insensitive match in the middle', () => {
    expect(highlightParts('Roadmap', 'road')).toEqual([
      { text: 'Road', match: true },
      { text: 'map', match: false },
    ]);
  });

  it('marks every occurrence', () => {
    expect(highlightParts('aXaXa', 'x')).toEqual([
      { text: 'a', match: false },
      { text: 'X', match: true },
      { text: 'a', match: false },
      { text: 'X', match: true },
      { text: 'a', match: false },
    ]);
  });

  it('returns a single plain run for an empty query, and [] for empty text', () => {
    expect(highlightParts('plain', '')).toEqual([{ text: 'plain', match: false }]);
    expect(highlightParts('', 'x')).toEqual([]);
  });

  it('returns one plain run when there is no match', () => {
    expect(highlightParts('nope', 'zzz')).toEqual([{ text: 'nope', match: false }]);
  });
});

describe('titleRank', () => {
  it('ranks exact < prefix < word-start < substring', () => {
    expect(titleRank('road', 'road')).toBe(0);
    expect(titleRank('roadmap', 'road')).toBe(1);
    expect(titleRank('my roadmap', 'road')).toBe(2);
    expect(titleRank('crossroad', 'road')).toBe(3);
  });

  it('is case-insensitive and treats an empty query as lowest priority', () => {
    expect(titleRank('ROAD', 'road')).toBe(0);
    expect(titleRank('anything', '')).toBe(3);
  });
});
