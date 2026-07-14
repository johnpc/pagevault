import { describe, it, expect } from 'vitest';
import { allDateMentions, dateMentionMatches } from './dateMention';

// A fixed local wall-clock instant so formatting is deterministic.
// (Month is 0-based: 6 = July.)
const NOW = new Date(2026, 6, 14, 15, 4); // Jul 14, 2026, 3:04 PM local

describe('allDateMentions', () => {
  it('resolves today / tomorrow / yesterday / now against the injected time', () => {
    const m = allDateMentions(NOW);
    const by = Object.fromEntries(m.map((x) => [x.key, x.insert]));
    expect(by.today).toBe('Jul 14, 2026');
    expect(by.tomorrow).toBe('Jul 15, 2026');
    expect(by.yesterday).toBe('Jul 13, 2026');
    expect(by.now).toBe('Jul 14, 2026 3:04 PM');
  });

  it('crosses month/year boundaries for tomorrow/yesterday', () => {
    const eve = new Date(2026, 11, 31, 9, 0); // Dec 31, 2026
    const by = Object.fromEntries(allDateMentions(eve).map((x) => [x.key, x.insert]));
    expect(by.tomorrow).toBe('Jan 1, 2027');
    const first = new Date(2026, 0, 1, 9, 0); // Jan 1, 2026
    const b2 = Object.fromEntries(allDateMentions(first).map((x) => [x.key, x.insert]));
    expect(b2.yesterday).toBe('Dec 31, 2025');
  });

  it('zero-pads minutes and uses 12-hour clock with AM/PM', () => {
    const noon = new Date(2026, 6, 14, 12, 5);
    expect(allDateMentions(noon).find((m) => m.key === 'now')!.insert).toBe(
      'Jul 14, 2026 12:05 PM',
    );
    const midnight = new Date(2026, 6, 14, 0, 0);
    expect(allDateMentions(midnight).find((m) => m.key === 'now')!.insert).toBe(
      'Jul 14, 2026 12:00 AM',
    );
  });
});

describe('dateMentionMatches', () => {
  it('filters by keyword prefix', () => {
    expect(dateMentionMatches('to', NOW).map((m) => m.key)).toEqual(['today', 'tomorrow']);
    expect(dateMentionMatches('n', NOW).map((m) => m.key)).toEqual(['now']);
    expect(dateMentionMatches('xyz', NOW)).toEqual([]);
  });

  it('offers all mentions for an empty query', () => {
    expect(dateMentionMatches('', NOW).map((m) => m.key)).toEqual([
      'today',
      'tomorrow',
      'yesterday',
      'now',
    ]);
  });
});
