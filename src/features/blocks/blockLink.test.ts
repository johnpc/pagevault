import { describe, it, expect } from 'vitest';
import { blockLink, blockIdFromHash } from './blockLink';

describe('blockLink', () => {
  it('builds a page URL with the block anchor hash', () => {
    expect(blockLink('https://pv.example.com', 'pageA', 'blk1')).toBe(
      'https://pv.example.com/page/pageA#pv-block-blk1',
    );
  });
  it('trims a trailing slash on the origin', () => {
    expect(blockLink('https://x.io/', 'p', 'b')).toBe('https://x.io/page/p#pv-block-b');
  });
});

describe('blockIdFromHash', () => {
  it('extracts the block id from a #pv-block-<id> hash (with or without #)', () => {
    expect(blockIdFromHash('#pv-block-abc')).toBe('abc');
    expect(blockIdFromHash('pv-block-abc')).toBe('abc');
  });
  it('round-trips with blockLink’s hash portion', () => {
    const url = blockLink('https://x', 'p', 'my-block-id');
    expect(blockIdFromHash('#' + url.split('#')[1])).toBe('my-block-id');
  });
  it('is null for an unrelated or empty hash', () => {
    expect(blockIdFromHash('#section-2')).toBeNull();
    expect(blockIdFromHash('')).toBeNull();
  });
});
