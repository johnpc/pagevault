import { describe, it, expect } from 'vitest';
import { markdownToBlocks, looksLikeMarkdown } from './markdownImport';

describe('markdownToBlocks', () => {
  it('parses headings, lists, todos, quote and paragraphs', () => {
    const md = [
      '# Title',
      '## Sub',
      '### Sub3',
      'A paragraph.',
      '- bullet one',
      '1. first',
      '- [ ] todo open',
      '- [x] todo done',
      '> a quote',
    ].join('\n');
    expect(markdownToBlocks(md)).toEqual([
      { type: 'heading', content: 'Title' },
      { type: 'subheading', content: 'Sub' },
      { type: 'subsubheading', content: 'Sub3' },
      { type: 'text', content: 'A paragraph.' },
      { type: 'bullet', content: 'bullet one', depth: 0 },
      { type: 'numbered', content: 'first', depth: 0 },
      { type: 'todo', content: 'todo open', depth: 0 },
      { type: 'todo', content: 'todo done', depth: 0 },
      { type: 'quote', content: 'a quote' },
    ]);
  });

  it('derives a nesting depth from a list item’s leading indentation', () => {
    const md = ['- top', '  - child', '    1. grandchild', '  - [ ] sub-task'].join('\n');
    expect(markdownToBlocks(md)).toEqual([
      { type: 'bullet', content: 'top', depth: 0 },
      { type: 'bullet', content: 'child', depth: 1 },
      { type: 'numbered', content: 'grandchild', depth: 2 },
      { type: 'todo', content: 'sub-task', depth: 1 },
    ]);
  });

  it('round-trips indentation with the exporter (import ∘ export identity for lists)', () => {
    // The exporter emits "  - x" for a depth-1 bullet; import must read it back.
    expect(markdownToBlocks('  - USB-C cable')).toEqual([
      { type: 'bullet', content: 'USB-C cable', depth: 1 },
    ]);
  });

  it('joins fenced code into one code block and drops blank lines', () => {
    const md = 'intro\n\n```\nline1\nline2\n```\n\noutro';
    expect(markdownToBlocks(md)).toEqual([
      { type: 'text', content: 'intro' },
      { type: 'code', content: 'line1\nline2' },
      { type: 'text', content: 'outro' },
    ]);
  });

  it('parses a horizontal rule as a divider', () => {
    expect(markdownToBlocks('a\n---\nb')).toEqual([
      { type: 'text', content: 'a' },
      { type: 'divider', content: '' },
      { type: 'text', content: 'b' },
    ]);
  });

  it('closes an unterminated code fence at end of input', () => {
    expect(markdownToBlocks('```\ncode here')).toEqual([{ type: 'code', content: 'code here' }]);
  });

  it('handles CRLF line endings', () => {
    expect(markdownToBlocks('# H\r\ntext')).toEqual([
      { type: 'heading', content: 'H' },
      { type: 'text', content: 'text' },
    ]);
  });
});

describe('looksLikeMarkdown', () => {
  it('is true for multi-line or markdown-prefixed text', () => {
    expect(looksLikeMarkdown('a\nb')).toBe(true);
    expect(looksLikeMarkdown('# heading')).toBe(true);
    expect(looksLikeMarkdown('- item')).toBe(true);
  });
  it('is false for a plain single line', () => {
    expect(looksLikeMarkdown('just some words')).toBe(false);
  });
});
