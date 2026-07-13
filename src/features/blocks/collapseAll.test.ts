import { describe, it, expect } from 'vitest';
import { toggleBlocks, shouldCollapseAll, collapseUpdates } from './collapseAll';
import type { BlockRecord } from '../../lib/pbClient';

const mk = (id: string, type: string, collapsed = false): BlockRecord =>
  ({ id, type, collapsed, content: '', page: 'p', sort: 0 }) as unknown as BlockRecord;

const page = () => [
  mk('a', 'text'),
  mk('t1', 'toggle', false),
  mk('b', 'text'),
  mk('t2', 'toggle', true),
];

describe('toggleBlocks', () => {
  it('returns only toggle blocks', () => {
    expect(toggleBlocks(page()).map((b) => b.id)).toEqual(['t1', 't2']);
    expect(toggleBlocks([mk('a', 'text')])).toEqual([]);
  });
});

describe('shouldCollapseAll', () => {
  it('is true when any toggle is open (collapse is the useful action)', () => {
    expect(shouldCollapseAll(page())).toBe(true);
  });
  it('is false when every toggle is already collapsed (so expand)', () => {
    expect(shouldCollapseAll([mk('t', 'toggle', true)])).toBe(false);
  });
  it('is false when there are no toggles', () => {
    expect(shouldCollapseAll([mk('a', 'text')])).toBe(false);
  });
});

describe('collapseUpdates', () => {
  it('collapses only the toggles that are currently open', () => {
    expect(collapseUpdates(page(), true)).toEqual([{ id: 't1', collapsed: true }]);
  });
  it('expands only the toggles that are currently collapsed', () => {
    expect(collapseUpdates(page(), false)).toEqual([{ id: 't2', collapsed: false }]);
  });
  it('is empty when nothing changes', () => {
    expect(collapseUpdates([mk('t', 'toggle', true)], true)).toEqual([]);
  });
});
