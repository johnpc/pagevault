import { describe, it, expect, beforeEach } from 'vitest';
import { readCollapsed, writeCollapsed, toggleCollapsed } from './expandStore';

describe('expandStore', () => {
  beforeEach(() => localStorage.clear());

  it('defaults to nothing collapsed (all expanded)', () => {
    expect(readCollapsed().size).toBe(0);
  });

  it('persists and reads the collapsed set', () => {
    writeCollapsed(new Set(['a', 'b']));
    const read = readCollapsed();
    expect(read.has('a')).toBe(true);
    expect(read.has('b')).toBe(true);
    expect(read.has('c')).toBe(false);
  });

  it('tolerates corrupt stored data', () => {
    localStorage.setItem('pv-collapsed', '{not json');
    expect(readCollapsed().size).toBe(0);
  });

  it('toggleCollapsed flips membership immutably', () => {
    const start = new Set<string>(['x']);
    const added = toggleCollapsed(start, 'y');
    expect(added.has('y')).toBe(true);
    expect(start.has('y')).toBe(false); // original untouched
    const removed = toggleCollapsed(added, 'x');
    expect(removed.has('x')).toBe(false);
  });
});
