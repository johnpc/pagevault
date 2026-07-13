import { describe, it, expect } from 'vitest';
import { summarize, summaryOptions, summaryLabel } from './tableSummary';

describe('summaryOptions', () => {
  it('offers the numeric family for number, checked/percent for checkbox, base otherwise', () => {
    for (const k of ['sum', 'avg', 'min', 'max', 'median', 'range']) {
      expect(summaryOptions('number')).toContain(k);
    }
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
    expect(summaryLabel('min')).toBe('Min');
    expect(summaryLabel('median')).toBe('Median');
    expect(summaryLabel('range')).toBe('Range');
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

  it('computes min, max, median, and range', () => {
    expect(summarize('min', ['3', '1', '2'])).toBe('1');
    expect(summarize('max', ['3', '1', '2'])).toBe('3');
    expect(summarize('median', ['3', '1', '2'])).toBe('2'); // odd count → middle
    expect(summarize('median', ['1', '2', '3', '4'])).toBe('2.5'); // even → mean of middle two
    expect(summarize('range', ['3', '1', '2', '10'])).toBe('9'); // 10 − 1
  });

  it('returns empty for a numeric summary with no numbers', () => {
    expect(summarize('sum', ['', 'x'])).toBe('');
    expect(summarize('median', ['', 'x'])).toBe('');
    expect(summarize('range', [])).toBe('');
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
