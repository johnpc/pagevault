import { describe, it, expect } from 'vitest';
import { blockToMarkdown, pageToMarkdown, fileSlug } from './exportMarkdown';
import type { BlockRecord, PageRecord } from '../../lib/pbClient';

const blk = (type: string, content: string, checked = false): BlockRecord =>
  ({
    id: type,
    type,
    content,
    checked,
    page: 'p1',
    sort: 0,
    owner: 'u1',
    created: '',
    updated: '',
    collectionId: 'c',
    collectionName: 'blocks',
  }) as BlockRecord;

describe('blockToMarkdown', () => {
  it('renders headings, lists, todos, quote, code, divider, text', () => {
    expect(blockToMarkdown(blk('heading', 'Title'))).toBe('# Title');
    expect(blockToMarkdown(blk('subheading', 'Sub'))).toBe('## Sub');
    expect(blockToMarkdown(blk('bullet', 'Item'))).toBe('- Item');
    expect(blockToMarkdown(blk('numbered', 'First'), 1)).toBe('1. First');
    expect(blockToMarkdown(blk('numbered', 'Third'), 3)).toBe('3. Third');
    expect(blockToMarkdown(blk('todo', 'Do it', false))).toBe('- [ ] Do it');
    expect(blockToMarkdown(blk('todo', 'Done', true))).toBe('- [x] Done');
    expect(blockToMarkdown(blk('quote', 'Wise'))).toBe('> Wise');
    expect(blockToMarkdown(blk('code', 'x = 1'))).toBe('```\nx = 1\n```');
    expect(blockToMarkdown(blk('divider', ''))).toBe('---');
    expect(blockToMarkdown(blk('text', 'Plain'))).toBe('Plain');
  });
});

describe('pageToMarkdown', () => {
  it('prefixes the title (with icon) and numbers consecutive numbered blocks', () => {
    const page = { title: 'Plan', icon: '🚀' } as PageRecord;
    const md = pageToMarkdown(page, [
      blk('text', 'Intro'),
      blk('numbered', 'One'),
      blk('numbered', 'Two'),
      blk('text', 'Break'),
      blk('numbered', 'Reset'),
    ]);
    expect(md).toContain('# 🚀 Plan');
    expect(md).toContain('1. One');
    expect(md).toContain('2. Two');
    // The run broke, so the last numbered block restarts at 1.
    expect(md).toContain('1. Reset');
  });

  it('falls back to Untitled for a blank title and omits a missing icon', () => {
    const md = pageToMarkdown({ title: '', icon: '' } as PageRecord, []);
    expect(md.startsWith('# Untitled')).toBe(true);
  });
});

describe('fileSlug', () => {
  it('slugifies a title', () => {
    expect(fileSlug('My Great Page!')).toBe('my-great-page');
  });
  it('falls back to untitled for empty/symbol-only titles', () => {
    expect(fileSlug('   ')).toBe('untitled');
    expect(fileSlug('!!!')).toBe('untitled');
  });
});
