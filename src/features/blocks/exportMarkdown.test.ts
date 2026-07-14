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
    expect(blockToMarkdown(blk('subsubheading', 'Sub3'))).toBe('### Sub3');
    expect(blockToMarkdown(blk('bullet', 'Item'))).toBe('- Item');
    expect(blockToMarkdown(blk('numbered', 'First'), 1)).toBe('1. First');
    expect(blockToMarkdown(blk('numbered', 'Third'), 3)).toBe('3. Third');
    expect(blockToMarkdown(blk('todo', 'Do it', false))).toBe('- [ ] Do it');
    expect(blockToMarkdown(blk('todo', 'Done', true))).toBe('- [x] Done');
    expect(blockToMarkdown(blk('quote', 'Wise'))).toBe('> Wise');
    expect(blockToMarkdown(blk('code', 'x = 1'))).toBe('```\nx = 1\n```');
    expect(blockToMarkdown(blk('divider', ''))).toBe('---');
    expect(blockToMarkdown(blk('bookmark', 'https://x.dev'))).toBe(
      '[https://x.dev](https://x.dev)',
    );
    // A code block with a language emits a fenced language.
    expect(blockToMarkdown({ ...blk('code', 'x = 1'), lang: 'python' })).toBe(
      '```python\nx = 1\n```',
    );
    expect(blockToMarkdown(blk('image', 'https://x/i.png'))).toBe('![](https://x/i.png)');
    expect(blockToMarkdown(blk('callout', 'Heads up'))).toBe('> 💡 Heads up');
    // A callout with a chosen emoji exports with that icon.
    expect(blockToMarkdown({ ...blk('callout', 'Careful'), emoji: '⚠️' })).toBe('> ⚠️ Careful');
    expect(blockToMarkdown(blk('text', 'Plain'))).toBe('Plain');
  });

  it('indents nested list items by depth (2 spaces per level)', () => {
    expect(blockToMarkdown({ ...blk('bullet', 'Sub'), depth: 1 })).toBe('  - Sub');
    expect(blockToMarkdown({ ...blk('numbered', 'Deep'), depth: 2 }, 3)).toBe('    3. Deep');
    expect(blockToMarkdown({ ...blk('todo', 'Sub-task'), depth: 1 })).toBe('  - [ ] Sub-task');
    // Non-list blocks ignore depth (no meaningful Markdown nesting).
    expect(blockToMarkdown({ ...blk('quote', 'Q'), depth: 2 })).toBe('> Q');
    expect(blockToMarkdown({ ...blk('heading', 'H'), depth: 1 })).toBe('# H');
  });

  it('renders a table block as a GFM table (checkbox cells become ✓/blank)', () => {
    const table = {
      ...blk('table', ''),
      data: {
        columns: [
          { name: 'Name', type: 'text' },
          { name: 'Qty', type: 'number' },
          { name: 'Done', type: 'checkbox' },
        ],
        rows: [
          ['Apples', '3', 'true'],
          ['Pears', '5', ''],
        ],
      },
    } as BlockRecord;
    expect(blockToMarkdown(table)).toBe(
      '| Name | Qty | Done |\n| --- | --- | --- |\n| Apples | 3 | ✓ |\n| Pears | 5 |  |',
    );
  });

  it('flattens a columns block to its contents split by a rule', () => {
    const columns = {
      ...blk('columns', ''),
      data: { cols: ['Left side', '', 'Right side'] },
    } as BlockRecord;
    expect(blockToMarkdown(columns)).toBe('Left side\n\n---\n\nRight side');
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
