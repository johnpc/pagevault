import { describe, it, expect } from 'vitest';
import { cellText } from './cellText';
import type { TableColumn } from '../../lib/pbTypes';

const rel: TableColumn = { name: 'Page', type: 'relation' };
const text: TableColumn = { name: 'Name', type: 'text' };
const titles = { p1: 'Roadmap', p2: 'Journal' };

describe('cellText', () => {
  it('resolves a relation cell (page id) to the linked title', () => {
    expect(cellText(rel, 'p1', titles)).toBe('Roadmap');
    expect(cellText(rel, 'p2', titles)).toBe('Journal');
  });

  it('is empty for an unlinked or unknown relation cell', () => {
    expect(cellText(rel, '', titles)).toBe('');
    expect(cellText(rel, 'missing', titles)).toBe('');
    expect(cellText(rel, 'p1')).toBe(''); // no title map
  });

  it('returns the raw value for non-relation columns', () => {
    expect(cellText(text, 'hello', titles)).toBe('hello');
  });
});
