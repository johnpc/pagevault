import { describe, it, expect } from 'vitest';
import { formatDate, dateFormatLabel, DATE_FORMATS } from './dateFormat';

const TODAY = '2026-01-05';

describe('formatDate', () => {
  it('returns the ISO value unchanged for iso / absent format', () => {
    expect(formatDate('2026-01-05', 'iso', TODAY)).toBe('2026-01-05');
    expect(formatDate('2026-01-05', undefined, TODAY)).toBe('2026-01-05');
  });

  it('formats medium (abbrev month) and long (full month)', () => {
    expect(formatDate('2026-01-05', 'medium', TODAY)).toBe('Jan 5, 2026');
    expect(formatDate('2026-12-31', 'long', TODAY)).toBe('December 31, 2026');
  });

  it('formats relative against the injected today', () => {
    expect(formatDate('2026-01-05', 'relative', TODAY)).toBe('Today');
    expect(formatDate('2026-01-06', 'relative', TODAY)).toBe('Tomorrow');
    expect(formatDate('2026-01-04', 'relative', TODAY)).toBe('Yesterday');
    expect(formatDate('2026-01-08', 'relative', TODAY)).toBe('in 3 days');
    expect(formatDate('2026-01-02', 'relative', TODAY)).toBe('3 days ago');
  });

  it('counts relative deltas across month/year boundaries', () => {
    expect(formatDate('2026-02-04', 'relative', TODAY)).toBe('in 30 days');
    expect(formatDate('2025-12-31', 'relative', TODAY)).toBe('5 days ago');
  });

  it('passes through empty or malformed values untouched', () => {
    expect(formatDate('', 'medium', TODAY)).toBe('');
    expect(formatDate('not-a-date', 'long', TODAY)).toBe('not-a-date');
    expect(formatDate('2026-13-40', 'medium', TODAY)).toBe('2026-13-40');
  });
});

describe('dateFormatLabel', () => {
  it('labels every format', () => {
    for (const f of DATE_FORMATS) expect(dateFormatLabel(f).length).toBeGreaterThan(0);
    expect(dateFormatLabel('relative')).toContain('Relative');
  });
});
