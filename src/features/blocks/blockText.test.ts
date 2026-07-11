import { describe, it, expect } from 'vitest';
import { placeholderFor, cycleType, markdownShortcut } from './blockText';

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
  it('labels list and code blocks', () => {
    expect(placeholderFor('bullet')).toBe('List item');
    expect(placeholderFor('numbered')).toBe('List item');
    expect(placeholderFor('code')).toBe('Code');
  });
  it('prompts for a URL on an image block', () => {
    expect(placeholderFor('image')).toMatch(/image url/i);
  });
});

describe('cycleType', () => {
  it('advances through the type order and wraps', () => {
    expect(cycleType('text')).toBe('heading');
    expect(cycleType('divider')).toBe('text');
  });
  it('includes the new list + code types in the cycle', () => {
    expect(cycleType('subheading')).toBe('bullet');
    expect(cycleType('bullet')).toBe('numbered');
    expect(cycleType('code')).toBe('image');
    expect(cycleType('image')).toBe('divider');
  });
});

describe('markdownShortcut', () => {
  it('maps heading prefixes', () => {
    expect(markdownShortcut('# ')).toEqual({ type: 'heading', content: '' });
    expect(markdownShortcut('## ')).toEqual({ type: 'subheading', content: '' });
    expect(markdownShortcut('### ')).toEqual({ type: 'subheading', content: '' });
  });
  it('maps list prefixes', () => {
    expect(markdownShortcut('- ')?.type).toBe('bullet');
    expect(markdownShortcut('* ')?.type).toBe('bullet');
    expect(markdownShortcut('1. ')?.type).toBe('numbered');
  });
  it('maps todo, quote, code and divider prefixes', () => {
    expect(markdownShortcut('[] ')?.type).toBe('todo');
    expect(markdownShortcut('[ ] ')?.type).toBe('todo');
    expect(markdownShortcut('> ')?.type).toBe('quote');
    expect(markdownShortcut('``` ')?.type).toBe('code');
    expect(markdownShortcut('--- ')?.type).toBe('divider');
  });
  it('returns null for ordinary text (including a partial prefix)', () => {
    expect(markdownShortcut('hello')).toBeNull();
    expect(markdownShortcut('#heading')).toBeNull();
    expect(markdownShortcut('# heading')).toBeNull();
  });
});
