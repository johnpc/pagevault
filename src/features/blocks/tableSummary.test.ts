import { describe, it, expect } from 'vitest';
import { summarize, summaryOptions, summaryLabel } from './tableSummary';

describe('summaryOptions', () => {
  it('offers sum/avg for number, checked/percent for checkbox, base otherwise', () => {
    expect(summaryOptions('number')).toContain('sum');
    expect(summaryOptions('number')).toContain('avg');
    expect(summaryOptions('checkbox')).toContain('checked');
    expect(summaryOptions('checkbox')).toContain('percent');
    expect(summaryOptions('text')).toEqual(['none', 'count', 'empty', 'unique']);
    expect(summaryOptions('number')).not.toContain('checked');
  });
});

describe('summaryLabel', () => {
  it('labels every kind, with a friendly default for none', () => {
    expect(summaryLabel('none')).toBe('Calculate');
    expect(summaryLabel('sum')).toBe('Sum');
    expect(summaryLabel('percent')).toBe('Percent checked');
  });
});

describe('summarize', () => {
  it('counts non-empty and empty cells', () => {
    expect(summarize('count', ['a', '', 'b', ''])).toBe('2');
    expect(summarize('empty', ['a', '', 'b', ''])).toBe('2');
  });

  it('counts distinct non-empty values', () => {
    expect(summarize('unique', ['a', 'a', 'b', ''])).toBe('2');
  });

  it('sums and averages numbers, ignoring blanks/junk', () => {
    expect(summarize('sum', ['10', '5', '', 'x'])).toBe('15');
    expect(summarize('avg', ['10', '20', ''])).toBe('15');
  });

  it('returns empty for a numeric summary with no numbers', () => {
    expect(summarize('sum', ['', 'x'])).toBe('');
  });

  it('rounds to 2 decimals', () => {
    expect(summarize('avg', ['1', '2'])).toBe('1.5');
    expect(summarize('avg', ['1', '1', '2'])).toBe('1.33'); // 4/3 → 1.33
  });

  it('counts checked and computes percent for checkboxes', () => {
    expect(summarize('checked', ['true', '', 'true'])).toBe('2');
    expect(summarize('percent', ['true', '', 'true', ''])).toBe('50%');
    expect(summarize('percent', [])).toBe('0%');
  });

  it('returns empty string for none', () => {
    expect(summarize('none', ['a', 'b'])).toBe('');
  });
});
