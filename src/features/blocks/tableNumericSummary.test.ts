import { describe, it, expect } from 'vitest';
import { numericSummary } from './tableNumericSummary';

describe('numericSummary', () => {
  it('sums and averages, ignoring non-numeric strings', () => {
    expect(numericSummary('sum', ['10', '5', 'x'])).toBe('15');
    expect(numericSummary('avg', ['10', '20'])).toBe('15');
  });

  it('finds min and max regardless of input order', () => {
    expect(numericSummary('min', ['3', '1', '2'])).toBe('1');
    expect(numericSummary('max', ['3', '1', '2'])).toBe('3');
  });

  it('takes the median (middle for odd, mean-of-two for even)', () => {
    expect(numericSummary('median', ['5', '1', '3'])).toBe('3');
    expect(numericSummary('median', ['1', '2', '3', '4'])).toBe('2.5');
  });

  it('computes the range as max minus min', () => {
    expect(numericSummary('range', ['2', '10', '5'])).toBe('8');
  });

  it('handles negatives and decimals with 2-dp rounding', () => {
    expect(numericSummary('min', ['-4', '0', '2'])).toBe('-4');
    expect(numericSummary('avg', ['1', '1', '2'])).toBe('1.33');
  });

  it('returns empty when there are no parseable numbers', () => {
    expect(numericSummary('sum', ['', 'x'])).toBe('');
    expect(numericSummary('range', [])).toBe('');
  });
});
