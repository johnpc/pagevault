import { describe, it, expect } from 'vitest';
import { restorePayload } from './restoreBlock';
import type { BlockRecord } from '../../lib/pbClient';

const block: BlockRecord = {
  id: 'blk123',
  page: 'pg1',
  type: 'todo',
  content: 'Buy milk',
  checked: true,
  collapsed: false,
  file: '',
  data: null,
  color: 'red',
  lang: '',
  emoji: '',
  align: '',
  depth: 2,
  sort: 42,
  owner: 'u1',
  created: '2026-01-01',
  updated: '2026-01-02',
  collectionId: 'c',
  collectionName: 'blocks',
};

describe('restorePayload', () => {
  it('keeps the id and sort so the block returns to its original slot', () => {
    const p = restorePayload(block);
    expect(p.id).toBe('blk123');
    expect(p.sort).toBe(42);
    expect(p.depth).toBe(2);
  });

  it('preserves content and formatting fields', () => {
    const p = restorePayload(block);
    expect(p).toMatchObject({
      type: 'todo',
      content: 'Buy milk',
      checked: true,
      color: 'red',
      page: 'pg1',
      owner: 'u1',
    });
  });

  it('drops server-managed system fields', () => {
    const p = restorePayload(block);
    expect(p).not.toHaveProperty('created');
    expect(p).not.toHaveProperty('updated');
    expect(p).not.toHaveProperty('collectionId');
    expect(p).not.toHaveProperty('collectionName');
  });
});
