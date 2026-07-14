import { describe, it, expect } from 'vitest';
import { emojiSearch } from './emojiSearch';
import { EMOJIS } from './emojiData';

describe('emojiSearch', () => {
  it('returns the whole set for a blank query', () => {
    expect(emojiSearch('')).toEqual(EMOJIS);
    expect(emojiSearch('   ')).toEqual(EMOJIS);
  });

  it('matches on keywords, case-insensitively', () => {
    expect(emojiSearch('calendar').map((e) => e.char)).toContain('📅');
    expect(emojiSearch('CALENDAR').map((e) => e.char)).toContain('📅');
  });

  it('matches a keyword substring across multiple emojis', () => {
    const goals = emojiSearch('goal').map((e) => e.char);
    expect(goals).toContain('🎯');
    expect(goals).toContain('🏆');
  });

  it('matches the literal emoji char', () => {
    expect(emojiSearch('🚀').map((e) => e.char)).toEqual(['🚀']);
  });

  it('returns nothing for an unknown query', () => {
    expect(emojiSearch('zzzznope')).toEqual([]);
  });
});
