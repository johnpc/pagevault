import { describe, it, expect } from 'vitest';
import { placeholderFor, cycleType } from './blockText';

describe('placeholderFor', () => {
  it('gives a writing prompt for text', () => {
    expect(placeholderFor('text')).toMatch(/writing/i);
  });
  it('labels headings and todos', () => {
    expect(placeholderFor('heading')).toBe('Heading');
    expect(placeholderFor('todo')).toBe('To-do');
  });
  it('has no placeholder for a divider', () => {
    expect(placeholderFor('divider')).toBe('');
  });
  it('labels subheading and quote', () => {
    expect(placeholderFor('subheading')).toBe('Subheading');
    expect(placeholderFor('quote')).toBe('Quote');
  });
});

describe('cycleType', () => {
  it('advances through the type order and wraps', () => {
    expect(cycleType('text')).toBe('heading');
    expect(cycleType('divider')).toBe('text');
  });
});
