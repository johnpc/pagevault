import { describe, it, expect } from 'vitest';
import { blocksToMarkdown } from './selectionMarkdown';
import type { BlockRecord } from '../../lib/pbClient';

const blk = (over: Partial<BlockRecord>): BlockRecord =>
  ({ type: 'text', content: '', depth: 0, ...over }) as BlockRecord;

describe('blocksToMarkdown', () => {
  it('serializes a run of blocks (no page title) with blank-line separators', () => {
    const md = blocksToMarkdown([
      blk({ type: 'heading', content: 'Title' }),
      blk({ type: 'text', content: 'A paragraph.' }),
    ]);
    expect(md).toBe('# Title\n\nA paragraph.');
  });

  it('numbers consecutive numbered blocks and resets after a break', () => {
    const md = blocksToMarkdown([
      blk({ type: 'numbered', content: 'one' }),
      blk({ type: 'numbered', content: 'two' }),
      blk({ type: 'text', content: 'break' }),
      blk({ type: 'numbered', content: 'fresh' }),
    ]);
    expect(md).toBe('1. one\n\n2. two\n\nbreak\n\n1. fresh');
  });

  it('is empty for no blocks', () => {
    expect(blocksToMarkdown([])).toBe('');
  });
});
