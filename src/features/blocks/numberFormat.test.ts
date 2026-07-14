import { describe, it, expect } from 'vitest';
import { formatNumber, numberFormatLabel, NUMBER_FORMATS } from './numberFormat';

describe('formatNumber', () => {
  it('returns the value unchanged for plain / absent format', () => {
    expect(formatNumber('1000', 'plain')).toBe('1000');
    expect(formatNumber('1000', undefined)).toBe('1000');
  });

  it('groups thousands with commas (with decimals + sign)', () => {
    expect(formatNumber('1000', 'comma')).toBe('1,000');
    expect(formatNumber('1234567', 'comma')).toBe('1,234,567');
    expect(formatNumber('-1234.5', 'comma')).toBe('-1,234.5');
    expect(formatNumber('999', 'comma')).toBe('999');
  });

  it('renders percent by scaling ×100', () => {
    expect(formatNumber('0.5', 'percent')).toBe('50%');
    expect(formatNumber('1', 'percent')).toBe('100%');
  });

  it('cleans binary-float noise from the ×100 scaling', () => {
    // 0.07 * 100 === 7.000000000000001 in IEEE 754 — must display as 7%.
    expect(formatNumber('0.07', 'percent')).toBe('7%');
    expect(formatNumber('0.29', 'percent')).toBe('29%');
    expect(formatNumber('0.001', 'percent')).toBe('0.1%');
  });

  it('renders currencies with symbol, 2 decimals, and grouping', () => {
    expect(formatNumber('1000', 'usd')).toBe('$1,000.00');
    expect(formatNumber('5.5', 'eur')).toBe('€5.50');
    expect(formatNumber('-12', 'gbp')).toBe('-£12.00');
  });

  it('passes through empty or non-numeric values untouched', () => {
    expect(formatNumber('', 'usd')).toBe('');
    expect(formatNumber('abc', 'comma')).toBe('abc');
    expect(formatNumber('  ', 'percent')).toBe('  ');
  });
});

describe('numberFormatLabel', () => {
  it('labels every format', () => {
    for (const f of NUMBER_FORMATS) expect(numberFormatLabel(f).length).toBeGreaterThan(0);
    expect(numberFormatLabel('usd')).toBe('US Dollar ($)');
  });
});
